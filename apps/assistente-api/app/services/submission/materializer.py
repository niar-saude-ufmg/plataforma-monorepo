from __future__ import annotations

import json
from datetime import datetime, timezone

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    ExportArtifact,
    Project,
    ProjectVersion,
    ProjectDocument,
    ProjectStatus,
    ProjectStatusHistory,
    WizardSession,
)

from app.services.llm.prompts import PROJECT_DOC_SECTIONS


def build_characterization_snapshot(session: WizardSession) -> dict:
    section_data = json.loads(session.section_data or "{}")

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

async def materialize_project(
    *,
    db_session: AsyncSession,
    session: WizardSession,
    user_id: int,
    docx_artifact: ExportArtifact,
) -> Project:
    existing = await db_session.execute(
        select(Project)
        .join(ProjectVersion, ProjectVersion.project_id == Project.id)
        .where(ProjectVersion.source_wizard_session_id == session.id)
        .order_by(ProjectVersion.version_number.desc())
        .limit(1)
    )
    project = existing.scalar_one_or_none()
    submitted_at = datetime.now(timezone.utc)
    snapshot = build_characterization_snapshot(session)

    if project:
        project.title = session.title
        project.updated_at = submitted_at

        last_status_result = await db_session.execute(
            select(ProjectStatusHistory)
            .join(ProjectVersion, ProjectVersion.id == ProjectStatusHistory.project_version_id)
            .where(ProjectVersion.project_id == project.id)
            .order_by(desc(ProjectStatusHistory.created_at))
            .limit(1)
        )
        last_status = last_status_result.scalar_one_or_none()
        if last_status is None:
            project.submitted_at = project.submitted_at or submitted_at
            notes = "Primeira submissão"
            status = ProjectStatus.submitted_to_committee
        else:
            notes = (
                "Reenvio com ajustes solicitados"
                if last_status.status == ProjectStatus.needs_changes
                else "Reenvio da submissão"
            )
            status = ProjectStatus.resubmitted_to_committee

        max_result = await db_session.execute(
            select(func.coalesce(func.max(ProjectVersion.version_number), 0))
            .where(ProjectVersion.project_id == project.id)
        )
        next_version_number = max_result.scalar_one() + 1

        version = ProjectVersion(
            project_id=project.id,
            version_number=next_version_number,
            source_wizard_session_id=session.id,
            characterization_snapshot=snapshot,
            status=status,
            submitted_at=submitted_at,
        )
        db_session.add(version)
        await db_session.flush()
    else:
        project = Project(
            owner_user_id=user_id,
            title=session.title,
            submitted_at=submitted_at,
        )
        db_session.add(project)
        await db_session.flush()


        version = ProjectVersion(
            project_id=project.id,
            version_number=1,
            source_wizard_session_id=session.id,
            characterization_snapshot=snapshot,
            status=ProjectStatus.submitted_to_committee,
            submitted_at=submitted_at,
        )
        db_session.add(version)
        await db_session.flush()

        notes = "Primeira submissão"
        status = ProjectStatus.submitted_to_committee

    db_session.add(
        ProjectDocument(
            project_version_id=version.id,
            source_export_artifact=docx_artifact,
            document_type="project_docx",
            storage_path=docx_artifact.file_path,
            original_filename=docx_artifact.filename,
        )
    )
    db_session.add(
        ProjectStatusHistory(
            project_version_id=version.id,
            status=status,
            actor_user_id=user_id,
            notes=notes,
        )
    )

    return project
