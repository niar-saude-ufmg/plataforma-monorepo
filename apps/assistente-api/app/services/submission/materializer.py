from __future__ import annotations

import json
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Evaluation,
    EvaluationStatus,
    ExportArtifact,
    Project,
    ProjectVersion,
    ProjectDocument,
    ProjectStatus,
    ProjectStatusHistory,
    WizardSession,
)

from app.services.llm.prompts import PROJECT_DOC_SECTIONS
from app.services.wizards.section_migration import migrate_section_data


def build_characterization_snapshot(session: WizardSession) -> dict:
    section_data = migrate_section_data(json.loads(session.section_data or "{}"))

    sections = {}
    for key in PROJECT_DOC_SECTIONS:
        if key in section_data:
            sections[key] = {
                "collected": True,
                "value": section_data[key],
            }
        else:
            sections[key] = {
                "collected": False,
                "value": None,
            }

    return {
        "schema_version": 1,
        "title": session.title,
        "sections": sections,
        "llm_model_used": session.llm_model_used,
    }


async def submission_state(
    db: AsyncSession, session: WizardSession, *, lock: bool = False
) -> tuple[Project | None, ProjectVersion | None, Evaluation | None]:
    linked = (await db.execute(
        select(ProjectVersion)
        .where(ProjectVersion.source_wizard_session_id == session.id)
        .order_by(ProjectVersion.version_number.desc()).limit(1)
    )).scalar_one_or_none()
    if linked is None:
        return None, None, None

    query = select(Project).where(Project.id == linked.project_id)
    if lock:
        query = query.with_for_update().execution_options(populate_existing=True)
    project = (await db.execute(query)).scalar_one()
    latest = (await db.execute(
        select(ProjectVersion).where(ProjectVersion.project_id == project.id)
        .order_by(ProjectVersion.version_number.desc()).limit(1)
        .execution_options(populate_existing=True)
    )).scalar_one()
    evaluation = (await db.execute(
        select(Evaluation).where(Evaluation.project_version_id == latest.id)
        .order_by(Evaluation.round_number.desc(), Evaluation.id.desc()).limit(1)
        .execution_options(populate_existing=True)
    )).scalar_one_or_none()
    return project, latest, evaluation


def pending_revision(version: ProjectVersion, evaluation: Evaluation | None) -> Evaluation | None:
    if (
        version.status == ProjectStatus.needs_changes
        and evaluation is not None
        and evaluation.delivery_number == 0
        and evaluation.status in (EvaluationStatus.project_changes_requested, EvaluationStatus.needs_changes)
    ):
        return evaluation
    return None


async def assert_submission_allowed(
    db: AsyncSession, session: WizardSession, user_id: int
) -> tuple[Project | None, ProjectVersion | None, Evaluation | None]:
    if session.user_id != user_id:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    project, latest, evaluation = await submission_state(db, session, lock=True)
    if project is not None:
        if project.owner_user_id != user_id:
            raise HTTPException(status_code=404, detail="Projeto não encontrado")
        if latest.source_wizard_session_id != session.id:
            raise HTTPException(status_code=409, detail="Esta sessão pertence a uma versão antiga do projeto")
        evaluation = pending_revision(latest, evaluation)
        if evaluation is None:
            raise HTTPException(status_code=409, detail="Reenvio exige solicitação vigente de alterações do projeto")
        consumed = (await db.execute(
            select(ProjectVersion.id).where(ProjectVersion.revision_evaluation_id == evaluation.id)
        )).scalar_one_or_none()
        if consumed is not None:
            raise HTTPException(status_code=409, detail="Esta solicitação de alterações já foi atendida")
    return project, latest, evaluation


async def materialize_project(
    *,
    db_session: AsyncSession,
    session: WizardSession,
    user_id: int,
    docx_artifact: ExportArtifact,
    bundle_artifact: ExportArtifact | None = None,
) -> Project:
    # A sessão serializa a primeira submissão, quando o projeto ainda não existe.
    await db_session.execute(
        select(WizardSession.id).where(WizardSession.id == session.id).with_for_update()
    )
    project, latest, evaluation = await assert_submission_allowed(db_session, session, user_id)
    submitted_at = datetime.now(timezone.utc)
    if project is None:
        project = Project(owner_user_id=user_id, title=session.title, submitted_at=submitted_at)
        db_session.add(project)
        await db_session.flush()
    else:
        project.title = session.title
        project.updated_at = submitted_at

    status = ProjectStatus.resubmitted_for_review if latest else ProjectStatus.submitted_for_review
    version = ProjectVersion(
        project_id=project.id,
        version_number=latest.version_number + 1 if latest else 1,
        source_wizard_session_id=session.id,
        project_section_template_id=session.project_section_template_id,
        revision_evaluation_id=evaluation.id if evaluation else None,
        questionnaire_id=latest.questionnaire_id if latest else None,
        characterization_snapshot=build_characterization_snapshot(session),
        status=status,
        submitted_at=submitted_at,
    )
    db_session.add(version)
    await db_session.flush()
    for artifact in (docx_artifact, bundle_artifact):
        if artifact is not None:
            db_session.add(ProjectDocument(
                project_version_id=version.id,
                delivery_number=0,
                source_export_artifact=artifact,
                document_type=artifact.artifact_type,
                storage_path=artifact.file_path,
                original_filename=artifact.filename,
            ))
    db_session.add(ProjectStatusHistory(
        project_version_id=version.id,
        status=status,
        actor_user_id=user_id,
        evaluation_id=evaluation.id if evaluation else None,
        notes="Reenvio com ajustes solicitados" if latest else "Primeira submissão",
    ))
    return project
