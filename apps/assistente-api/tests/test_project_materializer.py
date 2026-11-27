import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException, Request

from app.api import projects as projects_module
from app.models import ExportArtifact, Project, ProjectVersion, ProjectDocument, ProjectStatus, ProjectStatusHistory
from app.services.submission import materializer


def result(value=None):
    response = MagicMock()
    response.scalar_one_or_none.return_value = value
    return response


def session():
    return SimpleNamespace(id=42, user_id=7, title="Projeto revisado", section_data='{"background":"Novo contexto"}', llm_model_used="", updated_at=None, project_section_template_id=None)


def database():
    db = MagicMock()
    db.execute = AsyncMock(return_value=result())
    db.commit = AsyncMock()
    db.rollback = AsyncMock()

    async def flush():
        for index, call in enumerate(db.add.call_args_list, 100):
            if getattr(call.args[0], "id", None) is None:
                call.args[0].id = index
    db.flush = AsyncMock(side_effect=flush)
    return db


def test_first_submission_creates_version_one_and_both_documents():
    db = database()
    artifacts = [ExportArtifact(session_id=42, artifact_type=kind, filename=kind, file_path=kind)
                 for kind in ("project_docx", "submission_bundle")]
    project = asyncio.run(materializer.materialize_project(
        db_session=db, session=session(), user_id=7, docx_artifact=artifacts[0], bundle_artifact=artifacts[1]))
    added = [call.args[0] for call in db.add.call_args_list]
    version = next(item for item in added if isinstance(item, ProjectVersion))
    documents = [item for item in added if isinstance(item, ProjectDocument)]
    assert version.version_number == 1
    assert version.revision_evaluation_id is None
    assert version.project_id == project.id
    assert version.status == ProjectStatus.submitted_for_review
    assert {doc.document_type for doc in documents} == {"project_docx", "submission_bundle"}
    assert all(doc.project_version_id == version.id and doc.delivery_number == 0 for doc in documents)
    assert db.execute.call_args_list[0].args[0]._for_update_arg is not None
    db.commit.assert_not_awaited()


def test_revision_preserves_snapshot_and_identifies_request():
    db = database()
    project = Project(id=3, owner_user_id=7, title="Título anterior")
    previous = ProjectVersion(id=4, project_id=3, version_number=1, source_wizard_session_id=42,
                              characterization_snapshot={"title": "Anterior"}, status=ProjectStatus.needs_changes)
    evaluation = SimpleNamespace(id=8)
    with patch.object(materializer, "assert_submission_allowed", new=AsyncMock(return_value=(project, previous, evaluation))):
        asyncio.run(materializer.materialize_project(db_session=db, session=session(), user_id=7,
                    docx_artifact=ExportArtifact(artifact_type="project_docx", filename="new.docx", file_path="new.docx")))
    added = [call.args[0] for call in db.add.call_args_list]
    version = next(item for item in added if isinstance(item, ProjectVersion))
    assert version.version_number == 2
    assert version.revision_evaluation_id == 8
    assert previous.characterization_snapshot == {"title": "Anterior"}
    assert next(item for item in added if isinstance(item, ProjectStatusHistory)).evaluation_id == 8


@pytest.mark.parametrize("status,evaluation_status,source,consumed,delivery", [
    ("under_review", "to_review", 42, None, 0),
    ("needs_changes", "report_changes_requested", 42, None, 1),
    ("needs_changes", "needs_changes_by_committee", 42, None, 0),
    ("under_review", "needs_changes", 42, None, 0),
    ("needs_changes", "needs_changes", 42, None, 1),
    ("needs_changes", "project_changes_requested", 99, None, 0),
    ("needs_changes", "project_changes_requested", 42, 9, 0),
])
def test_rejects_unauthorized_resubmission(status, evaluation_status, source, consumed, delivery):
    db = database()
    db.execute.return_value = result(consumed)
    state = (SimpleNamespace(id=3, owner_user_id=7),
             SimpleNamespace(id=4, status=status, source_wizard_session_id=source),
             SimpleNamespace(id=8, status=evaluation_status, delivery_number=delivery))
    with patch.object(materializer, "submission_state", new=AsyncMock(return_value=state)):
        with pytest.raises(HTTPException) as error:
            asyncio.run(materializer.assert_submission_allowed(db, session(), 7))
    assert error.value.status_code == 409
    db.add.assert_not_called()


def test_rejects_other_owner_before_generation():
    db = database()
    user = SimpleNamespace(id=99, email="other@example.org")
    with pytest.raises(HTTPException) as error:
        asyncio.run(projects_module.submit_for_review(42, MagicMock(spec=Request), user, db))
    assert error.value.status_code == 404
    db.add.assert_not_called()


@pytest.mark.parametrize("failure", ["persist", "commit"])
def test_failed_submission_rolls_back_and_removes_files(tmp_path, failure):
    db = database()
    document = MagicMock()
    document.save.side_effect = lambda output: output.write(b"docx")
    cleaning = SimpleNamespace(id=84, script_content="print('ok')", llm_model_used="", current_step="validation", updated_at=None)
    if failure == "commit":
        db.commit.side_effect = RuntimeError("commit failed")
    with (
        patch.object(projects_module, "_get_project_doc_session", new=AsyncMock(return_value=session())),
        patch.object(projects_module, "assert_submission_allowed", new=AsyncMock(return_value=(None, None, None))),
        patch.object(projects_module, "_get_linked_cleaning_session", new=AsyncMock(return_value=cleaning)),
        patch.object(projects_module, "get_exports_dir", return_value=str(tmp_path)),
        patch.object(projects_module, "build_project_doc", return_value=document),
        patch.object(projects_module, "build_submission_zip", return_value=b"zip"),
        patch.object(projects_module, "materialize_project", new=AsyncMock(side_effect=RuntimeError("persist failed") if failure == "persist" else None)),
        patch.object(projects_module, "log_audit", new=AsyncMock()),
    ):
        with pytest.raises(RuntimeError):
            asyncio.run(projects_module.submit_for_review(42, MagicMock(spec=Request), SimpleNamespace(id=7, email="owner@example.org"), db))
    db.rollback.assert_awaited_once()
    assert list(tmp_path.iterdir()) == []


def test_quality_check_returns_actionable_error_when_llm_is_unavailable():
    db = database()
    db.execute.return_value = result(session())
    with patch.object(projects_module, "run_quality_check", new=AsyncMock(side_effect=RuntimeError("GEMINI_API_KEY não está configurada"))):
        with pytest.raises(HTTPException) as error:
            asyncio.run(projects_module.quality_check(42, SimpleNamespace(id=7), db))
    assert error.value.status_code == 503
    assert "GEMINI_API_KEY" in str(error.value.detail)
