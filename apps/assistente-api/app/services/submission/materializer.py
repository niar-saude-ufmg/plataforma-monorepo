from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    ExportArtifact,
    Project,
    ProjectDocument,
    ProjectStatus,
    ProjectStatusHistory,
    WizardSession,
)


async def materialize_project(
    *,
    db_session: AsyncSession,
    session: WizardSession,
    user_id: int,
    docx_artifact: ExportArtifact,
) -> Project:
    await db_session.execute(
        select(WizardSession.id).where(WizardSession.id == session.id).with_for_update()
    )

    existing = await db_session.execute(
        select(Project).where(Project.source_wizard_session_id == session.id)
    )
    project = existing.scalar_one_or_none()
    submitted_at = datetime.now(timezone.utc)

    if project:
        project.title = session.title
        project.updated_at = submitted_at

        current_documents = await db_session.execute(
            select(ProjectDocument).where(
                ProjectDocument.project_id == project.id,
                ProjectDocument.is_current.is_(True),
            )
        )
        for current_document in current_documents.scalars().all():
            current_document.is_current = False

        last_status_result = await db_session.execute(
            select(ProjectStatusHistory)
            .where(ProjectStatusHistory.project_id == project.id)
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
    else:
        project = Project(
            owner_user_id=user_id,
            source_wizard_session_id=session.id,
            title=session.title,
            submitted_at=submitted_at,
        )
        db_session.add(project)
        await db_session.flush()
        notes = "Primeira submissão"
        status = ProjectStatus.submitted_to_committee

    db_session.add(
        ProjectDocument(
            project_id=project.id,
            source_export_artifact=docx_artifact,
            document_type="project_docx",
            storage_path=docx_artifact.file_path,
            original_filename=docx_artifact.filename,
            is_current=True,
        )
    )
    db_session.add(
        ProjectStatusHistory(
            project_id=project.id,
            status=status,
            actor_user_id=user_id,
            notes=notes,
        )
    )

    return project
