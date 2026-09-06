import asyncio
from unittest.mock import AsyncMock, MagicMock

from app.models import (
    ProjectStatusHistory,
    ProjectStatus,
)

from app.services.submission.materializer import materialize_project


def _mock_db_begin(db):
    """Faz com que db.begin() retorne um async context manager que chama db.commit no exit."""
    class _FakeBegin:
        async def __aenter__(self):
            return db
        async def __aexit__(self, exc_type, exc, tb):
            if exc_type is None:
                await db.commit()
            return False
    db.begin = MagicMock(return_value=_FakeBegin())


def make_mock_session(id=1, title="Test Project", user_id=1):
    session = MagicMock()
    session.id = id
    session.title = title
    session.user_id = user_id
    return session

def make_mock_artifact(id=1, filename="projeto.docx", file_path="/path/to/file.docx"):
    artifact = MagicMock()
    artifact.id = id
    artifact.filename = filename
    artifact.file_path = file_path
    return artifact


def test_materialize_first_submission():
    db = MagicMock()
    db.commit = AsyncMock()
    _mock_db_begin(db)

    session = make_mock_session()
    docx_artifact = make_mock_artifact()
    user_id = 1

    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = None
    db.execute = AsyncMock(return_value=result_mock)

    project = asyncio.run(materialize_project(
        db_session=db,
        session=session,
        user_id=user_id,
        docx_artifact=docx_artifact
    ))

    assert project.title == session.title
    assert project.owner_user_id == user_id
    assert project.source_wizard_session_id == session.id
    assert project.submitted_at is not None

    added_objects = [call[0][0] for call in db.add.call_args_list]
    status_history = next((obj for obj in added_objects if isinstance(obj, ProjectStatusHistory)), None)
    assert status_history is not None
    assert status_history.status == ProjectStatus.submitted_to_committee
    assert status_history.actor_user_id == user_id
    assert status_history.notes == "Primeira submissão"

    assert db.add.call_count == 3
    db.commit.assert_awaited_once()


def test_materialize_reenvio():
    db = MagicMock()
    db.commit = AsyncMock()
    _mock_db_begin(db)

    session = make_mock_session()
    docx_artifact = make_mock_artifact(id=2, filename="projeto_v2.docx", file_path="/path/to/v2.docx")
    user_id = 1

    existing_project = MagicMock()
    existing_project.id = 999
    existing_project.source_wizard_session_id = session.id

    old_doc = MagicMock()
    old_doc.is_current = True
    old_doc.id = 1

    last_status_mock = MagicMock()
    last_status_mock.scalar_one_or_none.return_value = None

    result_project_mock = MagicMock()
    result_project_mock.scalar_one_or_none.return_value = existing_project

    result_doc_mock = MagicMock()
    result_doc_mock.scalar_one_or_none.return_value = old_doc

    db.execute = AsyncMock(side_effect=[
        result_project_mock,
        result_doc_mock,
        last_status_mock,
    ])

    project = asyncio.run(materialize_project(
        db_session=db,
        session=session,
        user_id=user_id,
        docx_artifact=docx_artifact
    ))

    assert project.id == existing_project.id
    assert old_doc.is_current is False

    added_objects = [call[0][0] for call in db.add.call_args_list]
    status_history = next((obj for obj in added_objects if isinstance(obj, ProjectStatusHistory)), None)
    assert status_history is not None
    assert status_history.status == ProjectStatus.submitted_to_committee
    assert status_history.actor_user_id == user_id
    assert status_history.notes == "Reenvio da submissão"

    db.commit.assert_awaited_once()


def test_materialize_idempotencia():
    db = MagicMock()
    db.commit = AsyncMock()
    _mock_db_begin(db)

    session = make_mock_session()
    docx_artifact = make_mock_artifact()
    user_id = 1

    existing_project = MagicMock()
    existing_project.id = 999
    existing_project.source_wizard_session_id = session.id

    old_doc = MagicMock()
    old_doc.is_current = True
    old_doc.id = 1

    last_status_mock = MagicMock()
    last_status_mock.scalar_one_or_none.return_value = None

    result_project_mock = MagicMock()
    result_project_mock.scalar_one_or_none.return_value = existing_project

    result_doc_mock = MagicMock()
    result_doc_mock.scalar_one_or_none.return_value = old_doc

    db.execute = AsyncMock(side_effect=[
        result_project_mock,
        result_doc_mock,
        last_status_mock,
    ])

    project = asyncio.run(materialize_project(
        db_session=db,
        session=session,
        user_id=user_id,
        docx_artifact=docx_artifact
    ))

    assert project.id == existing_project.id
    assert db.add.call_count == 2
    db.commit.assert_awaited_once()
