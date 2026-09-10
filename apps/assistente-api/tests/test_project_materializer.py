import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException, Request

from app.api import projects as projects_module
from app.models import (
    ExportArtifact,
    Project,
    ProjectDocument,
    ProjectStatus,
    ProjectStatusHistory,
    User,
    WizardType,
)
from app.services.submission.materializer import materialize_project


# =============================================================================
# Funções utilitárias
# =============================================================================

def query_result(value=None, *, scalars=None):
    """Cria um mock de resultado de db.execute."""
    result = MagicMock()
    result.scalar_one_or_none.return_value = value
    if scalars is not None:
        result.scalars.return_value.all.return_value = scalars
    return result


def added_objects(db):
    """Extrai as instâncias adicionadas via db.add em ordem de chamada."""
    return [call.args[0] for call in db.add.call_args_list]


# =============================================================================
# Fixtures
# =============================================================================

@pytest.fixture
def make_session():
    """Factory para criar uma sessão mockada (SimpleNamespace)."""

    def _factory(session_id=1, title="Projeto de teste", user_id=1):
        return SimpleNamespace(
            id=session_id,
            title=title,
            user_id=user_id,
            section_data="{}",
            llm_model_used="",
            updated_at=None,
        )

    return _factory


@pytest.fixture
def make_artifact():
    """Factory para criar um ExportArtifact real (dataclass leve)."""

    def _factory(artifact_id=1, filename="projeto.docx", file_path="/tmp/projeto.docx"):
        return ExportArtifact(
            id=artifact_id,
            session_id=1,
            filename=filename,
            file_path=file_path,
            artifact_type="project_docx",
        )

    return _factory


@pytest.fixture
def make_db():
    """Factory para criar um mock de AsyncSession configurável."""

    def _factory(*execute_results):
        db = MagicMock()
        db.execute = AsyncMock(side_effect=execute_results)
        db.flush = AsyncMock()
        db.commit = AsyncMock()
        db.add = MagicMock()
        return db

    return _factory


# =============================================================================
# Testes de Unidade — Materializer (app/services/submission/materializer.py)
# =============================================================================

class TestMaterializeProject:
    def test_first_submission_creates_project_document_and_history(
        self, make_db, make_session, make_artifact
    ):
        """Primeira submissão: cria projeto, documento atual e histórico inicial."""
        db = make_db(query_result(), query_result(None))
        session = make_session()
        artifact = make_artifact()

        project = asyncio.run(
            materialize_project(
                db_session=db,
                session=session,
                user_id=session.user_id,
                docx_artifact=artifact,
            )
        )

        assert project.title == session.title
        assert project.owner_user_id == session.user_id
        assert project.source_wizard_session_id == session.id
        assert project.submitted_at is not None

        objects = added_objects(db)
        document = next(item for item in objects if isinstance(item, ProjectDocument))
        history = next(item for item in objects if isinstance(item, ProjectStatusHistory))

        assert document.document_type == "project_docx"
        assert document.source_export_artifact is artifact
        assert document.is_current is True
        assert history.status == ProjectStatus.submitted_to_committee
        assert history.actor_user_id == session.user_id
        assert history.notes == "Primeira submissão"
        db.flush.assert_awaited_once()
        db.commit.assert_not_awaited()

    def test_resubmission_reuses_project_and_replaces_current_document(
        self, make_db, make_session, make_artifact
    ):
        """Reenvio: reaproveita o projeto, arquiva documentos antigos e registra novo status."""
        session = make_session(title="Projeto atualizado")
        artifact = make_artifact(
            artifact_id=2,
            filename="projeto_v2.docx",
            file_path="/tmp/projeto_v2.docx",
        )
        existing_project = Project(
            id=999,
            owner_user_id=session.user_id,
            source_wizard_session_id=session.id,
            title="Projeto antigo",
        )
        old_documents = [
            ProjectDocument(
                id=1,
                project_id=existing_project.id,
                document_type="project_docx",
                original_filename="v1.docx",
                storage_path="/tmp/v1.docx",
                is_current=True,
            ),
            ProjectDocument(
                id=2,
                project_id=existing_project.id,
                document_type="project_docx",
                original_filename="v1-copy.docx",
                storage_path="/tmp/v1-copy.docx",
                is_current=True,
            ),
        ]
        last_status = ProjectStatusHistory(
            project_id=existing_project.id,
            status=ProjectStatus.needs_changes,
            actor_user_id=10,
            notes="Ajustar projeto",
        )
        db = make_db(
            query_result(),
            query_result(existing_project),
            query_result(scalars=old_documents),
            query_result(last_status),
        )

        result = asyncio.run(
            materialize_project(
                db_session=db,
                session=session,
                user_id=session.user_id,
                docx_artifact=artifact,
            )
        )

        assert result is existing_project
        assert existing_project.title == "Projeto atualizado"
        assert existing_project.submitted_at is None
        assert all(document.is_current is False for document in old_documents)

        objects = added_objects(db)
        assert not any(isinstance(item, Project) for item in objects)
        document = next(item for item in objects if isinstance(item, ProjectDocument))
        history = next(item for item in objects if isinstance(item, ProjectStatusHistory))
        assert document.original_filename == artifact.filename
        assert history.status == ProjectStatus.resubmitted_to_committee
        assert history.notes == "Reenvio com ajustes solicitados"
        db.flush.assert_not_awaited()
        db.commit.assert_not_awaited()

    def test_existing_project_without_history_is_treated_as_first_submission(
        self, make_db, make_session, make_artifact
    ):
        """Projeto existente sem histórico (estado inconsistente) é tratado como primeira submissão."""
        session = make_session()
        artifact = make_artifact()
        existing_project = Project(
            id=999,
            owner_user_id=session.user_id,
            source_wizard_session_id=session.id,
            title=session.title,
            submitted_at=None,
        )
        db = make_db(
            query_result(),
            query_result(existing_project),
            query_result(scalars=[]),
            query_result(None),
        )

        result = asyncio.run(
            materialize_project(
                db_session=db,
                session=session,
                user_id=session.user_id,
                docx_artifact=artifact,
            )
        )

        history = next(
            item for item in added_objects(db) if isinstance(item, ProjectStatusHistory)
        )
        assert result is existing_project
        assert existing_project.submitted_at is not None
        assert history.status == ProjectStatus.submitted_to_committee
        assert history.notes == "Primeira submissão"


# =============================================================================
# Testes de Unidade — Endpoint submit_for_review (app/api/projects.py)
# =============================================================================

class TestSubmitForReview:
    def test_submit_materializes_official_docx(self, tmp_path, make_db, make_session):
        """Fluxo feliz: validação, geração de docx, materialização e bundle .zip."""
        session = make_session(session_id=42, user_id=7)
        cleaning = SimpleNamespace(
            id=84,
            script_content="print('ok')",
            llm_model_used="",
            current_step="validation",
            updated_at=None,
        )

        current_user = MagicMock(spec=User)
        current_user.id = 7
        current_user.email = "pesquisador@niar.local"
        request = MagicMock(spec=Request)
        request = MagicMock(spec=Request)
        request.client = SimpleNamespace(host="127.0.0.1")
        settings = SimpleNamespace(llm_model="modelo-teste")
        document = MagicMock()
        document.save.side_effect = lambda target: target.write(b"docx oficial")
        db = make_db()

        with (
            patch.object(
                projects_module,
                "_get_project_doc_session",
                new=AsyncMock(return_value=session),
            ) as project_session_mock,
            patch.object(
                projects_module,
                "_get_linked_cleaning_session",
                new=AsyncMock(return_value=cleaning),
            ) as cleaning_session_mock,
            patch.object(projects_module, "get_settings", return_value=settings),
            patch.object(projects_module, "get_exports_dir", return_value=str(tmp_path)),
            patch.object(
                projects_module,
                "validate_script",
                return_value={"syntax_ok": True, "safety_ok": True},
            ),
            patch.object(projects_module, "build_project_doc", return_value=document),
            patch.object(
                projects_module, "build_submission_zip", return_value=b"zip tecnico"
            ),
            patch.object(
                projects_module,
                "materialize_project",
                new=AsyncMock(return_value=SimpleNamespace(id=123)),
            ) as materialize_mock,
            patch.object(projects_module, "log_audit", new=AsyncMock()),
        ):
            response = asyncio.run(
                projects_module.submit_for_review(
                    session_id=session.id,
                    request=request,
                    current_user=current_user,
                    db=db,
                )
            )

        assert response.media_type == (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        assert "attachment" in response.headers.get("content-disposition", "").lower()
        assert ".docx" in response.headers.get("content-disposition", "").lower()

        db.flush.assert_awaited_once()
        db.commit.assert_awaited_once()
        materialize_mock.assert_awaited_once()
        project_session_mock.assert_awaited_once_with(db, session.id, current_user.id)
        cleaning_session_mock.assert_awaited_once_with(db, session.id, current_user.id)

        artifact = materialize_mock.await_args.kwargs["docx_artifact"] # type: ignore[union-attr]
        assert isinstance(artifact, ExportArtifact)
        assert artifact.session_id == session.id
        assert artifact.artifact_type == "project_docx"
        assert artifact.filename.endswith(".docx")
        assert (tmp_path / artifact.filename).read_bytes() == b"docx oficial"

    def test_submit_returns_404_when_session_belongs_to_another_user(
        self, make_db, make_session
    ):
        """
        Segurança: um pesquisador não pode submeter a sessão de outro usuário.
        A proteção ocorre em _get_project_doc_session, que filtra por user_id.
        """
        owner_id = 7
        intruder_id = 99
        session = make_session(session_id=42, user_id=owner_id)
        current_user = MagicMock(spec=User)
        current_user.id = intruder_id
        current_user.email = "intruso@niar.local"
        request = MagicMock(spec=Request)
        request.client = SimpleNamespace(host="127.0.0.1")

        # O db retorna None para a query que filtra por (session_id, intruder_id)
        db = make_db(query_result(None))

        with (
            patch.object(
                projects_module, "get_settings", return_value=SimpleNamespace(llm_model="modelo-teste")
            ),
            patch.object(projects_module, "get_exports_dir", return_value="/tmp"),
            patch.object(projects_module, "log_audit", new=AsyncMock()),
        ):
            with pytest.raises(HTTPException) as exc_info:
                asyncio.run(
                    projects_module.submit_for_review(
                        session_id=session.id,
                        request=request,
                        current_user=current_user,
                        db=db,
                    )
                )

        assert exc_info.value.status_code == 404
        db.commit.assert_not_awaited()
        db.flush.assert_not_awaited()
