"""PostgreSQL integration tests; TEST_DATABASE_URL must point at a disposable database."""
import asyncio
import json
import os
from io import BytesIO
from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from uuid import uuid4
from zipfile import ZipFile

import pytest
from fastapi import HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.api import projects
from app.models import (Evaluation, EvaluationStatus, ProjectDocument, ProjectSectionTemplate,
                        ProjectVersion, ProjectStatus, User, WizardSession, WizardType)
from app.schemas import WizardSessionUpdate

pytestmark = pytest.mark.skipif(not os.getenv("TEST_DATABASE_URL"), reason="TEST_DATABASE_URL is required")


@pytest.mark.parametrize("request_status", [EvaluationStatus.project_changes_requested, EvaluationStatus.needs_changes])
def test_submissions_and_revisions_are_atomic_under_concurrency(tmp_path, request_status):
    async def scenario():
        url = os.environ["TEST_DATABASE_URL"].replace("postgresql://", "postgresql+asyncpg://", 1)
        engine = create_async_engine(url, connect_args={"server_settings": {"search_path": "assistant,shared,admin,public"}})
        sessions = async_sessionmaker(engine, expire_on_commit=False)
        try:
            async with sessions() as db:
                user = User(email=f"{uuid4()}@example.org", full_name="Researcher", hashed_password="test")
                db.add(user)
                template = ProjectSectionTemplate(template_key=str(uuid4()), name="Modelo original", version=1, definition_json={})
                db.add(template)
                await db.flush()
                wizard = WizardSession(user_id=user.id, title="Título original", wizard_type=WizardType.project_doc,
                                       current_step="project", project_section_template_id=template.id,
                                       section_data=json.dumps({"background": "Conteúdo original", "_wizard_flow_version": 2}))
                db.add(wizard)
                await db.flush()
                db.add(WizardSession(user_id=user.id, title="Engenharia", wizard_type=WizardType.data_clean,
                                     current_step="validation", linked_project_id=wizard.id, script_content="print('ok')"))
                await db.commit()
                user_id, wizard_id = user.id, wizard.id

            request = MagicMock(spec=Request)
            request.client = SimpleNamespace(host="127.0.0.1")
            async def submit():
                async with sessions() as db:
                    return await projects.submit_for_review(wizard_id, request, user, db)

            # Use real document generation and real files; both requests start together.
            with patch.object(projects, "get_exports_dir", return_value=str(tmp_path)):
                first = await asyncio.gather(submit(), submit(), return_exceptions=True)
                assert sum(not isinstance(item, Exception) for item in first) == 1
                assert next(item for item in first if isinstance(item, Exception)).status_code == 409
                original_files = {path.name: path.read_bytes() for path in tmp_path.iterdir()}
                assert len(original_files) == 2
                async with sessions() as db:
                    old = (await db.execute(select(ProjectVersion).where(ProjectVersion.source_wizard_session_id == wizard_id))).scalar_one()
                    project_id = old.project_id
                    original_snapshot = old.characterization_snapshot
                    old.status = ProjectStatus.needs_changes
                    evaluation = Evaluation(project_version_id=old.id, round_number=1, delivery_number=0,
                                            status=request_status,
                                            justification="Ajustar métodos", assigned_to_user_id=user_id)
                    db.add(evaluation)
                    await db.commit()
                    evaluation_id = evaluation.id
                    response = await projects.update_project(wizard_id, WizardSessionUpdate(title="Título revisado", section_data={"background": "Revisão", "_wizard_flow_version": 2}), user, db)
                    assert response.submission.revision_request.evaluation_id == evaluation_id
                    assert response.submission.snapshot == original_snapshot
                    assert response.section_data["background"] == "Revisão"
                    saved = await projects.save_draft(wizard_id, WizardSessionUpdate(title="Rascunho salvo"), request, user, db)
                    detail = await projects.get_project(wizard_id, user, db)
                    listed = await projects.list_projects(user, db)
                    listed_session = next(item for item in listed if item.id == wizard_id)
                    for item in (saved, detail, listed_session):
                        assert item.submission.revision_request.evaluation_id == evaluation_id
                        assert item.submission.snapshot == original_snapshot
                    assert listed_session.linked_cleaning_step == "export"
                    assert len((await db.execute(select(ProjectVersion).where(ProjectVersion.project_id == project_id))).scalars().all()) == 1

                revised = await asyncio.gather(submit(), submit(), return_exceptions=True)
                assert sum(not isinstance(item, Exception) for item in revised) == 1
                assert next(item for item in revised if isinstance(item, Exception)).status_code == 409
                assert len(list(tmp_path.iterdir())) == 4
                assert all((tmp_path / name).read_bytes() == content for name, content in original_files.items())
                revised_docx = next(path for path in tmp_path.glob("*.docx") if path.name not in original_files)
                revised_bundle = next(path for path in tmp_path.glob("*.zip") if path.name not in original_files)
                with ZipFile(BytesIO(revised_docx.read_bytes())) as document:
                    xml = document.read("word/document.xml").decode()
                    assert "Revisão" in xml
                    assert "Conteúdo original" not in xml
                with ZipFile(revised_bundle) as bundle:
                    assert bundle.read("projeto.docx") == revised_docx.read_bytes()
                    assert bundle.read("data_clean.py").decode() == "print('ok')"
                async with sessions() as db:
                    versions = (await db.execute(select(ProjectVersion).where(ProjectVersion.project_id == project_id).order_by(ProjectVersion.version_number))).scalars().all()
                    assert [version.version_number for version in versions] == [1, 2]
                    assert all(version.project_section_template_id == template.id for version in versions)
                    assert versions[0].characterization_snapshot == original_snapshot
                    assert versions[1].revision_evaluation_id == evaluation_id
                    assert versions[1].characterization_snapshot["title"] == "Rascunho salvo"
                    assert versions[1].characterization_snapshot["sections"]["background"] == {"collected": True, "value": "Revisão"}
                    documents = (await db.execute(select(ProjectDocument).where(ProjectDocument.project_version_id.in_([v.id for v in versions])))).scalars().all()
                    assert len(documents) == 4
                    assert len({doc.storage_path for doc in documents}) == 4
                    # Simulate a newer session taking over the latest version.
                    newer = WizardSession(user_id=user_id, title="Nova sessão", wizard_type=WizardType.project_doc, current_step="project")
                    db.add(newer)
                    await db.flush()
                    versions[1].source_wizard_session_id = newer.id
                    versions[1].status = ProjectStatus.needs_changes
                    db.add(Evaluation(
                        project_version_id=versions[1].id,
                        status=EvaluationStatus.project_changes_requested,
                    ))
                    await db.commit()
                    stale = await projects.get_project(wizard_id, user, db)
                    current = await projects.get_project(newer.id, user, db)
                    assert stale.submission.revision_request is None
                    assert current.submission.revision_request is not None
                with pytest.raises(HTTPException) as error:
                    await submit()
                assert error.value.status_code == 409
                assert len(list(tmp_path.iterdir())) == 4
        finally:
            await engine.dispose()
    asyncio.run(scenario())


def test_storage_failure_does_not_register_submission_and_can_be_retried(tmp_path):
    async def scenario():
        from app.core import config
        from app.models import ExportArtifact
        url = os.environ["TEST_DATABASE_URL"].replace("postgresql://", "postgresql+asyncpg://", 1)
        engine = create_async_engine(url, connect_args={"server_settings": {"search_path": "assistant,shared,admin,public"}})
        sessions = async_sessionmaker(engine, expire_on_commit=False)
        unavailable = tmp_path / "exports"
        unavailable.write_text("Não é um diretório")
        fallback = tmp_path / "fallback"
        try:
            async with sessions() as db:
                user = User(email=f"{uuid4()}@example.org", full_name="Owner", hashed_password="test")
                db.add(user)
                await db.flush()
                wizard = WizardSession(user_id=user.id, title="Armazenamento", wizard_type=WizardType.project_doc, current_step="project")
                db.add(wizard)
                await db.flush()
                db.add(WizardSession(user_id=user.id, wizard_type=WizardType.data_clean, current_step="validation", linked_project_id=wizard.id, script_content="print('ok')"))
                await db.commit()
                wizard_id = wizard.id
            request = MagicMock(spec=Request)
            request.client = SimpleNamespace(host="127.0.0.1")
            with patch.object(config, "get_settings", return_value=SimpleNamespace(exports_dir=str(unavailable))), patch.object(config, "_DEFAULT_EXPORTS_DIR", fallback):
                async with sessions() as db:
                    with pytest.raises(HTTPException) as error:
                        await projects.submit_for_review(wizard_id, request, user, db)
                    assert error.value.status_code == 503
                assert not fallback.exists()
                async with sessions() as db:
                    assert not (await db.execute(select(ProjectVersion).where(ProjectVersion.source_wizard_session_id == wizard_id))).scalars().all()
                    assert not (await db.execute(select(ExportArtifact).where(ExportArtifact.session_id == wizard_id))).scalars().all()
                unavailable.unlink()
                unavailable.mkdir()
                async with sessions() as db:
                    response = await projects.submit_for_review(wizard_id, request, user, db)
                    assert response.status_code == 200
                assert len(list(unavailable.iterdir())) == 2
                assert not fallback.exists()
        finally:
            await engine.dispose()
    asyncio.run(scenario())
