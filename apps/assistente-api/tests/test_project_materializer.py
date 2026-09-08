import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from app.api import projects as projects_module
from app.models import (
    ExportArtifact,
    Project,
    ProjectDocument,
    ProjectStatus,
    ProjectStatusHistory,
)
from app.services.submission.materializer import materialize_project


def query_result(value=None, *, scalars=None):
    result = MagicMock()
    result.scalar_one_or_none.return_value = value
    if scalars is not None:
        result.scalars.return_value.all.return_value = scalars
    return result


def make_session(session_id=1, title="Projeto de teste", user_id=1):
    return SimpleNamespace(
        id=session_id,
        title=title,
        user_id=user_id,
        section_data="{}",
        llm_model_used="",
        updated_at=None,
    )


def make_artifact(
    artifact_id=1, filename="projeto.docx", file_path="/tmp/projeto.docx"
):
    return ExportArtifact(
        id=artifact_id,
        session_id=1,
        filename=filename,
        file_path=file_path,
        artifact_type="project_docx",
    )


def make_db(*execute_results):
    db = MagicMock()
    db.execute = AsyncMock(side_effect=execute_results)
    db.flush = AsyncMock()
    db.commit = AsyncMock()
    db.add = MagicMock()
    return db


def added_objects(db):
    return [call.args[0] for call in db.add.call_args_list]


def test_materialize_first_submission():
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


def test_materialize_resubmission_reuses_project_and_replaces_current_document():
    session = make_session(title="Projeto atualizado")
    artifact = make_artifact(
        artifact_id=2,
        filename="projeto_v2.docx",
        file_path="/tmp/projeto_v2.docx",
    )
    project = Project(
        id=999,
        owner_user_id=session.user_id,
        source_wizard_session_id=session.id,
        title="Projeto antigo",
    )
    old_documents = [
        ProjectDocument(
            id=1,
            project_id=project.id,
            document_type="project_docx",
            original_filename="v1.docx",
            storage_path="/tmp/v1.docx",
            is_current=True,
        ),
        ProjectDocument(
            id=2,
            project_id=project.id,
            document_type="project_docx",
            original_filename="v1-copy.docx",
            storage_path="/tmp/v1-copy.docx",
            is_current=True,
        ),
    ]
    last_status = ProjectStatusHistory(
        project_id=project.id,
        status=ProjectStatus.needs_changes,
        actor_user_id=10,
        notes="Ajustar projeto",
    )
    db = make_db(
        query_result(),
        query_result(project),
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

    assert result is project
    assert project.title == "Projeto atualizado"
    assert project.submitted_at is None
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


def test_existing_project_without_history_is_a_first_submission():
    session = make_session()
    artifact = make_artifact()
    project = Project(
        id=999,
        owner_user_id=session.user_id,
        source_wizard_session_id=session.id,
        title=session.title,
        submitted_at=None,
    )
    db = make_db(
        query_result(),
        query_result(project),
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
    assert result is project
    assert project.submitted_at is not None
    assert history.status == ProjectStatus.submitted_to_committee
    assert history.notes == "Primeira submissão"


def test_submit_materializes_the_official_docx(tmp_path):
    session = make_session(session_id=42, user_id=7)
    cleaning = SimpleNamespace(
        id=84,
        script_content="print('ok')",
        llm_model_used="",
        current_step="validation",
        updated_at=None,
    )
    current_user = SimpleNamespace(id=7, email="pesquisador@niar.local")
    request = SimpleNamespace(client=SimpleNamespace(host="127.0.0.1"))
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

    assert response.body == b"zip tecnico"
    assert response.media_type == "application/zip"
    db.flush.assert_awaited_once()
    db.commit.assert_awaited_once()
    materialize_mock.assert_awaited_once()
    project_session_mock.assert_awaited_once_with(db, session.id, current_user.id)
    cleaning_session_mock.assert_awaited_once_with(db, session.id, current_user.id)

    artifact = materialize_mock.await_args.kwargs["docx_artifact"]
    assert isinstance(artifact, ExportArtifact)
    assert artifact.session_id == session.id
    assert artifact.artifact_type == "project_docx"
    assert artifact.filename.endswith(".docx")
    assert (tmp_path / artifact.filename).read_bytes() == b"docx oficial"
