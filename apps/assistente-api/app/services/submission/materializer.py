"""Materializer for submission project to committee."""

from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import (
    WizardSession,
    Project,
    ProjectDocument,
    ProjectStatusHistory,
    ProjectStatus,
    ExportArtifact
)

async def materialize_project(
    *,
    db_session: AsyncSession,
    session: WizardSession,
    user_id: int,
    docx_artifact: ExportArtifact,
) -> Project:
    """Materialize a project from a wizard session and a DOCX artifact."""

    existing = await db_session.execute(
        select(Project).where(Project.source_wizard_session_id == session.id)
    )
    project = existing.scalar_one_or_none()

    if project:
        async with db_session.begin():
            query_old_doc = await db_session.execute(
                select(ProjectDocument).where(
                    ProjectDocument.project_id == project.id,
                    ProjectDocument.is_current,
                )
            )
            old_doc = query_old_doc.scalar_one_or_none()

            if old_doc:
                old_doc.is_current = False

            new_doc = ProjectDocument(
                project=project,
                source_export_artifact=docx_artifact,
                storage_path=docx_artifact.file_path,
                original_filename=docx_artifact.filename,
                is_current=True,
            )
            db_session.add(new_doc)

            last_status = await db_session.execute(
                select(ProjectStatusHistory)
                .where(ProjectStatusHistory.project_id == project.id)
                .order_by(desc(ProjectStatusHistory.created_at))
                .limit(1)
            )
            last = last_status.scalar_one_or_none()

            notes = "Reenvio da submissão"
            if last and last.status == ProjectStatus.needs_changes:
                notes = "Reenvio com ajustes solicitados"

            history = ProjectStatusHistory(
                project_id=project.id,
                status=ProjectStatus.submitted_to_committee,
                actor_user_id=user_id,
                notes=notes,
            )
            db_session.add(history)
    else:
        async with db_session.begin():
            project = Project(
                owner_user_id=user_id,
                source_wizard_session_id=session.id,
                title=session.title,
                submitted_at=datetime.now(timezone.utc),
            )
            db_session.add(project)

            project_doc = ProjectDocument(
                project=project,
                source_export_artifact=docx_artifact,
                storage_path=docx_artifact.file_path,
                original_filename=docx_artifact.filename,
                is_current=True,
            )
            db_session.add(project_doc)

            history = ProjectStatusHistory(
                project_id=project.id,
                status=ProjectStatus.submitted_to_committee,
                actor_user_id=user_id,
                notes="Primeira submissão",
            )
            db_session.add(history)

    return project
