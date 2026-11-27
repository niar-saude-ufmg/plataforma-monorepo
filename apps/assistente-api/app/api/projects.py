from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from io import BytesIO
from typing import Optional
from uuid import uuid4

from docx import Document
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.audit.service import log_audit
from app.core.config import get_exports_dir, get_settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import ChatMessage, ExportArtifact, ProjectSectionTemplate, User, WizardSession, WizardType
from app.schemas import (
    ChatMessageCreate,
    ChatMessageOut,
    ImportTextRequest,
    ProjectRevisionRequestOut,
    ProjectSubmissionOut,
    SectionMetaOut,
    SectionTemplateMetaOut,
    WizardSessionCreate,
    WizardSessionOut,
    WizardSessionUpdate,
)
from app.services.docgen.builder import build_project_doc
from app.services.llm.prompts import PROJECT_DOC_SECTIONS
from app.services.scriptgen.validator import validate_script
from app.services.submission.bundle import build_submission_zip
from app.services.submission.materializer import (
    assert_submission_allowed,
    materialize_project,
    pending_revision,
    submission_state,
)
from app.services.wizards.orchestrator import (
    extract_section_content,
    run_advisory_chat,
    run_doc_intake,
    run_quality_check,
    split_full_text_into_sections,
)
from app.services.wizards.section_migration import migrate_current_step, migrate_section_data
from app.services.wizards.text_import import should_use_chunked_import

router = APIRouter(prefix="/projects", tags=["projects"])


def _apply_session_migration(session: WizardSession) -> bool:
    changed = False
    section_data = json.loads(session.section_data or "{}")
    if section_data.get("_wizard_flow_version", 0) < 2:
        new_step = migrate_current_step(session.current_step, section_data)
        if new_step != session.current_step:
            session.current_step = new_step
            changed = True
    migrated = migrate_section_data(section_data)
    if migrated != section_data:
        session.section_data = json.dumps(migrated, ensure_ascii=False)
        changed = True
    return changed


def _session_out(session: WizardSession, *, linked_cleaning_step: Optional[str] = None) -> WizardSessionOut:
    section_data = migrate_section_data(json.loads(session.section_data or "{}"))
    step = session.current_step
    if section_data.get("_wizard_flow_version", 0) < 2:
        step = migrate_current_step(step, section_data)
    section_template_out = None
    if session.section_template is not None:
        definition = session.section_template.definition_json or {}
        section_template_out = SectionTemplateMetaOut(
            id=session.section_template.id,
            template_key=session.section_template.template_key,
            version=session.section_template.version,
            sections=[
                SectionMetaOut(
                    key=section["key"],
                    label=section["label"],
                    guidance=section["guidance"],
                    required=section["required"],
                )
                for section in definition.get("sections", [])
            ],
        )
    return WizardSessionOut(
        id=session.id,
        wizard_type=session.wizard_type.value,
        current_step=step,
        title=session.title,
        dataset_id=session.dataset_id,
        linked_project_id=session.linked_project_id,
        section_data=section_data,
        script_content=session.script_content,
        validation_result=json.loads(session.validation_result or "{}"),
        quality_checklist=json.loads(session.quality_checklist or "{}"),
        llm_model_used=session.llm_model_used,
        created_at=session.created_at.isoformat(),
        updated_at=session.updated_at.isoformat(),
        messages=[
            ChatMessageOut(
                id=m.id,
                role=m.role,
                content=m.content,
                channel=getattr(m, "channel", "intake") or "intake",
                section_key=getattr(m, "section_key", None),
                created_at=m.created_at.isoformat(),
            )
            for m in sorted(session.messages, key=lambda msg: msg.id)
        ],
        linked_cleaning_step=linked_cleaning_step,
        section_template=section_template_out,
    )


async def _session_with_submission(
    db: AsyncSession, session: WizardSession, *, linked_cleaning_step: Optional[str] = None
) -> WizardSessionOut:
    response = _session_out(session, linked_cleaning_step=linked_cleaning_step)
    project, version, evaluation = await submission_state(db, session)
    if version is not None:
        revision_request = None
        if version.source_wizard_session_id == session.id:
            revision = pending_revision(version, evaluation)
            if revision is not None:
                revision_request = ProjectRevisionRequestOut(
                    evaluation_id=revision.id,
                    justification=revision.justification,
                    requested_at=revision.evaluated_at.isoformat() if revision.evaluated_at else None,
                )
        response.submission = ProjectSubmissionOut(
            project_id=project.id,
            project_version_id=version.id,
            version_number=version.version_number,
            source_wizard_session_id=version.source_wizard_session_id,
            status=version.status.value,
            snapshot=version.characterization_snapshot,
            revision_request=revision_request,
        )
    return response


async def _get_project_doc_session(
    db: AsyncSession, session_id: int, user_id: int, *, load_messages: bool = False, lock: bool = False
) -> WizardSession:
    query = select(WizardSession).where(
        WizardSession.id == session_id,
        WizardSession.user_id == user_id,
        WizardSession.wizard_type == WizardType.project_doc,
    )
    if load_messages:
        query = query.options(selectinload(WizardSession.messages))
    if lock:
        query = query.with_for_update().execution_options(populate_existing=True)
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    return session


async def _get_linked_cleaning_session(
    db: AsyncSession, project_id: int, user_id: int, *, load_messages: bool = False
) -> Optional[WizardSession]:
    query = (
        select(WizardSession)
        .where(
            WizardSession.linked_project_id == project_id,
            WizardSession.user_id == user_id,
            WizardSession.wizard_type == WizardType.data_clean,
        )
        .order_by(WizardSession.updated_at.desc())
        .limit(1)
    )
    if load_messages:
        query = query.options(selectinload(WizardSession.messages))
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def _linked_cleaning_steps(
    db: AsyncSession, user_id: int, project_ids: list[int]
) -> dict[int, str]:
    if not project_ids:
        return {}
    result = await db.execute(
        select(WizardSession.linked_project_id, WizardSession.current_step)
        .where(
            WizardSession.user_id == user_id,
            WizardSession.wizard_type == WizardType.data_clean,
            WizardSession.linked_project_id.in_(project_ids),
        )
        .order_by(WizardSession.updated_at.desc())
    )
    steps: dict[int, str] = {}
    for linked_id, step in result.all():
        if linked_id is not None and linked_id not in steps:
            steps[linked_id] = step
    return steps


@router.get("", response_model=list[WizardSessionOut])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WizardSession)
        .where(
            WizardSession.user_id == current_user.id,
            WizardSession.wizard_type == WizardType.project_doc,
        )
        .options(selectinload(WizardSession.messages))
        .order_by(WizardSession.updated_at.desc())
    )
    projects = result.scalars().all()
    dirty = False
    for project in projects:
        if _apply_session_migration(project):
            dirty = True
    if dirty:
        await db.commit()
    cleaning_steps = await _linked_cleaning_steps(db, current_user.id, [p.id for p in projects])
    return [
        await _session_with_submission(db, p, linked_cleaning_step=cleaning_steps.get(p.id))
        for p in projects
    ]


@router.post("", response_model=WizardSessionOut, status_code=201)
async def create_project(
    body: WizardSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    section_data = {"_current_section": PROJECT_DOC_SECTIONS[0], "_wizard_flow_version": 2}

    template_result = await db.execute(
        select(ProjectSectionTemplate)
        .where(ProjectSectionTemplate.is_active == True)
        .limit(1)
    )
    template = template_result.scalar_one_or_none()
    if template is None:
        raise HTTPException(status_code=409, detail="Nenhum modelo de seções ativo encontrado")

    session = WizardSession(
        user_id=current_user.id,
        wizard_type=WizardType.project_doc,
        current_step="start",
        title=body.title,
        section_data=json.dumps(section_data),
        project_section_template_id=template.id,
    )
    db.add(session)
    await db.commit()
    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == session.id)
        .options(selectinload(WizardSession.messages))
    )
    return _session_out(result.scalar_one())


@router.get("/{session_id}", response_model=WizardSessionOut)
async def get_project(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == session_id, WizardSession.user_id == current_user.id)
        .options(selectinload(WizardSession.messages))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    if _apply_session_migration(session):
        session.updated_at = datetime.now(timezone.utc)
        await db.commit()
        result = await db.execute(
            select(WizardSession)
            .where(WizardSession.id == session_id)
            .options(selectinload(WizardSession.messages))
        )
        session = result.scalar_one()
    return await _session_with_submission(db, session)


@router.patch("/{session_id}", response_model=WizardSessionOut)
async def update_project(
    session_id: int,
    body: WizardSessionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == session_id, WizardSession.user_id == current_user.id)
        .options(selectinload(WizardSession.messages))
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    if body.title is not None:
        session.title = body.title
    if body.current_step is not None:
        session.current_step = body.current_step
    if body.section_data is not None:
        session.section_data = json.dumps(body.section_data)
    session.updated_at = datetime.now(timezone.utc)
    await db.commit()
    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == session_id)
        .options(selectinload(WizardSession.messages))
    )
    return await _session_with_submission(db, result.scalar_one())


@router.post("/{session_id}/save-draft", response_model=WizardSessionOut)
async def save_draft(
    session_id: int,
    body: WizardSessionUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == session_id, WizardSession.user_id == current_user.id)
        .options(selectinload(WizardSession.messages))
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    if body.title is not None:
        session.title = body.title
    if body.current_step is not None:
        session.current_step = body.current_step
    if body.section_data is not None:
        session.section_data = json.dumps(body.section_data)
    session.updated_at = datetime.now(timezone.utc)
    await log_audit(
        db,
        user_id=current_user.id,
        action="save_project_draft",
        resource_type="wizard_session",
        resource_id=str(session.id),
        ip_address=request.client.host if request.client else "",
    )
    await db.commit()
    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == session_id)
        .options(selectinload(WizardSession.messages))
    )
    return await _session_with_submission(db, result.scalar_one())


@router.post("/{session_id}/import-text", response_model=WizardSessionOut)
async def import_full_text(
    session_id: int,
    body: ImportTextRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == session_id, WizardSession.user_id == current_user.id)
        .options(selectinload(WizardSession.messages))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    try:
        sections, model, debug = await split_full_text_into_sections(body.full_text)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail={"message": str(exc), "debug": {"stage": "llm_call", "hint": "Execute backend/scripts/debug_import.py ou GET /api/assistente/llm/status"}},
        ) from exc

    filled = sum(1 for v in sections.values() if v.strip())
    if filled == 0:
        message = (
            "Não foi possível extrair seções do texto longo. "
            "Tente adicionar títulos de seção explícitos (ex.: Contexto, Objetivos, Métodos) "
            "ou dividir o documento em partes menores."
            if should_use_chunked_import(body.full_text)
            else "Não foi possível extrair seções do texto. A resposta da IA estava vazia ou inválida."
        )
        raise HTTPException(
            status_code=502,
            detail={"message": message, "debug": debug},
        )

    section_data = migrate_section_data(json.loads(session.section_data or "{}"))
    section_data.update(sections)
    section_data["_current_section"] = PROJECT_DOC_SECTIONS[0]
    section_data["_imported"] = True
    section_data["_wizard_flow_version"] = 2
    session.section_data = json.dumps(section_data, ensure_ascii=False)
    session.current_step = "project"
    session.llm_model_used = model
    session.updated_at = datetime.now(timezone.utc)

    note = ChatMessage(
        session_id=session.id,
        role="assistant",
        content="Texto completo do projeto importado e dividido em seções predefinidas. Revise e edite cada seção abaixo.",
    )
    db.add(note)
    await db.commit()
    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == session_id)
        .options(selectinload(WizardSession.messages))
    )
    return _session_out(result.scalar_one())


@router.post("/{session_id}/import-docx", response_model=WizardSessionOut)
async def import_docx(
    session_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename or not file.filename.lower().endswith(".docx"):
        raise HTTPException(status_code=400, detail="Envie um arquivo .docx")

    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == session_id, WizardSession.user_id == current_user.id)
        .options(selectinload(WizardSession.messages))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Arquivo vazio")

    try:
        document = Document(BytesIO(raw))
        full_text = "\n".join(p.text for p in document.paragraphs if p.text.strip())
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Não foi possível ler o arquivo .docx") from exc

    if len(full_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="O documento não contém texto suficiente para importar.")

    try:
        sections, model, debug = await split_full_text_into_sections(full_text)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail={"message": str(exc), "debug": {"stage": "llm_call"}},
        ) from exc

    filled = sum(1 for v in sections.values() if v.strip())
    if filled == 0:
        message = (
            "Não foi possível extrair seções do documento. "
            "Tente adicionar títulos de seção explícitos (ex.: Contexto, Objetivos, Métodos)."
        )
        raise HTTPException(status_code=502, detail={"message": message, "debug": debug})

    section_data = migrate_section_data(json.loads(session.section_data or "{}"))
    section_data.update(sections)
    section_data["_current_section"] = PROJECT_DOC_SECTIONS[0]
    section_data["_imported"] = True
    section_data["_wizard_flow_version"] = 2
    session.section_data = json.dumps(section_data, ensure_ascii=False)
    session.current_step = "project"
    session.llm_model_used = model
    session.updated_at = datetime.now(timezone.utc)

    note = ChatMessage(
        session_id=session.id,
        role="assistant",
        content="Documento .docx importado e dividido em seções predefinidas. Revise e edite cada seção abaixo.",
    )
    db.add(note)
    await db.commit()
    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == session_id)
        .options(selectinload(WizardSession.messages))
    )
    return _session_out(result.scalar_one())


@router.post("/{session_id}/chat", response_model=ChatMessageOut)
async def project_chat(
    session_id: int,
    body: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == session_id, WizardSession.user_id == current_user.id)
        .options(selectinload(WizardSession.messages))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    section_data = json.loads(session.section_data or "{}")
    current_section = section_data.get("_current_section", PROJECT_DOC_SECTIONS[0])

    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=body.content,
        channel="intake",
        section_key=current_section,
    )
    db.add(user_msg)
    await db.flush()

    reply = await run_doc_intake(db, session, body.content)
    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=reply,
        channel="intake",
        section_key=current_section,
    )
    db.add(assistant_msg)
    session.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(assistant_msg)
    return ChatMessageOut(
        id=assistant_msg.id,
        role=assistant_msg.role,
        content=assistant_msg.content,
        channel=assistant_msg.channel,
        section_key=assistant_msg.section_key,
        created_at=assistant_msg.created_at.isoformat(),
    )


@router.post("/{session_id}/advisory-chat", response_model=ChatMessageOut)
async def project_advisory_chat(
    session_id: int,
    body: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == session_id, WizardSession.user_id == current_user.id)
        .options(selectinload(WizardSession.messages))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    user_msg = ChatMessage(
        session_id=session.id, role="user", content=body.content, channel="advisory"
    )
    db.add(user_msg)
    await db.flush()

    reply = await run_advisory_chat(db, session, body.content)
    assistant_msg = ChatMessage(
        session_id=session.id, role="assistant", content=reply, channel="advisory"
    )
    db.add(assistant_msg)
    session.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(assistant_msg)
    return ChatMessageOut(
        id=assistant_msg.id,
        role=assistant_msg.role,
        content=assistant_msg.content,
        channel=assistant_msg.channel,
        section_key=assistant_msg.section_key,
        created_at=assistant_msg.created_at.isoformat(),
    )


@router.post("/{session_id}/extract/{section_key}")
async def extract_section(
    session_id: int,
    section_key: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == session_id, WizardSession.user_id == current_user.id)
        .options(selectinload(WizardSession.messages))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    extracted = await extract_section_content(db, session, section_key)
    return extracted


@router.post("/{session_id}/quality-check")
async def quality_check(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == session_id, WizardSession.user_id == current_user.id)
        .options(selectinload(WizardSession.messages))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    try:
        checklist = await run_quality_check(session)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Não foi possível executar a revisão do projeto: {exc}",
        ) from exc
    session.quality_checklist = json.dumps(checklist)
    session.current_step = "review"
    await db.commit()
    return checklist


@router.post("/{session_id}/export")
async def export_project(
    session_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    settings = get_settings()
    exports_dir = get_exports_dir()

    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == session_id, WizardSession.user_id == current_user.id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    section_data = json.loads(session.section_data or "{}")
    doc = build_project_doc(
        title=session.title,
        section_data=section_data,
        user_email=current_user.email,
        session_id=session.id,
        model_used=session.llm_model_used or settings.llm_model,
    )
    filename = f"project_{session.id}.docx"
    filepath = os.path.join(exports_dir, filename)
    doc.save(filepath)

    artifact = ExportArtifact(
        session_id=session.id,
        filename=filename,
        file_path=filepath,
        artifact_type="project_docx",
    )
    db.add(artifact)
    await log_audit(
        db,
        user_id=current_user.id,
        action="export_project_doc",
        resource_type="wizard_session",
        resource_id=str(session.id),
        ip_address=request.client.host if request.client else "",
    )
    await db.commit()
    return FileResponse(
        filepath,
        filename="project.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )


@router.post("/{session_id}/submit-for-review", response_class=FileResponse, responses={
    200: {"description": "DOCX submetido; DOCX e ZIP preservados na versão", "content": {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {"schema": {"type": "string", "format": "binary"}}
    }},
    400: {"description": "Engenharia de dados ou script ausente ou inválido"},
    409: {"description": "Reenvio sem solicitação vigente, versão antiga ou solicitação já atendida"},
    503: {"description": "Diretório de exports indisponível; submissão não registrada"},
    404: {"description": "Sessão não encontrada ou sem propriedade"},
})
async def submit_for_review(
    session_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    settings = get_settings()

    project = await _get_project_doc_session(db, session_id, current_user.id, lock=True)
    _, current_version, revision_request = await assert_submission_allowed(db, project, current_user.id)

    cleaning = await _get_linked_cleaning_session(db, session_id, current_user.id)
    if not cleaning:
        raise HTTPException(
            status_code=400,
            detail="Inicie a engenharia de dados e gere o script antes de submeter.",
        )
    if not cleaning.script_content.strip():
        raise HTTPException(
            status_code=400,
            detail="Gere o script data_clean.py antes de submeter para avaliação.",
        )

    validation = validate_script(cleaning.script_content)
    if not validation.get("syntax_ok") or not validation.get("safety_ok"):
        issues = validation.get("issues") or []
        raise HTTPException(
            status_code=400,
            detail={
                "message": "O script contém problemas que impedem a submissão. Corrija e valide novamente.",
                "validation": validation,
                "issues": issues,
            },
        )

    try:
        exports_dir = get_exports_dir()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    section_data = migrate_section_data(json.loads(project.section_data or "{}"))
    doc = build_project_doc(
        title=project.title,
        section_data=section_data,
        user_email=current_user.email,
        session_id=project.id,
        model_used=project.llm_model_used or settings.llm_model,
    )
    doc_buffer = BytesIO()
    doc.save(doc_buffer)
    docx_bytes = doc_buffer.getvalue()
    submission_id = uuid4().hex
    docx_filename = f"project_{project.id}_submission_{submission_id}.docx"
    zip_filename = f"submissao_projeto_{project.id}_{submission_id}.zip"
    docx_path = os.path.join(exports_dir, docx_filename)
    zip_path = os.path.join(exports_dir, zip_filename)
    zip_bytes = build_submission_zip(
        project_title=project.title,
        project_id=project.id,
        cleaning_session_id=cleaning.id,
        user_email=current_user.email,
        docx_bytes=docx_bytes,
        script_content=cleaning.script_content,
        model_used=cleaning.llm_model_used or settings.llm_model,
    )
    written_paths = []
    try:
        for path, content in ((docx_path, docx_bytes), (zip_path, zip_bytes)):
            with open(path, "xb") as output:
                written_paths.append(path)
                output.write(content)
        docx_artifact = ExportArtifact(
            session_id=project.id, filename=docx_filename, file_path=docx_path, artifact_type="project_docx"
        )
        bundle_artifact = ExportArtifact(
            session_id=project.id, filename=zip_filename, file_path=zip_path, artifact_type="submission_bundle"
        )
        db.add_all([docx_artifact, bundle_artifact])
        await materialize_project(
            db_session=db, session=project, user_id=current_user.id,
            docx_artifact=docx_artifact, bundle_artifact=bundle_artifact,
        )
        cleaning.current_step = "export"
        project.updated_at = datetime.now(timezone.utc)
        cleaning.updated_at = datetime.now(timezone.utc)
        await log_audit(
            db, user_id=current_user.id, action="submit_project_for_review",
            resource_type="wizard_session", resource_id=str(project.id),
            details=json.dumps({
                "version_number": current_version.version_number + 1 if current_version else 1,
                "revision_evaluation_id": revision_request.id if revision_request else None,
                "docx_filename": docx_filename, "bundle_filename": zip_filename,
            }),
            ip_address=request.client.host if request.client else "",
        )
        await db.commit()
    except BaseException:
        try:
            await db.rollback()
        finally:
            for path in written_paths:
                os.unlink(path)
        raise

    return FileResponse(
        docx_path, filename=docx_filename,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )


@router.get("/{session_id}/cleaning", response_model=WizardSessionOut)
async def get_project_cleaning(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_project_doc_session(db, session_id, current_user.id)
    cleaning = await _get_linked_cleaning_session(
        db, session_id, current_user.id, load_messages=True
    )
    if not cleaning:
        raise HTTPException(status_code=404, detail="Engenharia de dados não iniciada para este projeto")
    return _session_out(cleaning)


@router.post("/{session_id}/cleaning", response_model=WizardSessionOut, status_code=201)
async def create_project_cleaning(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_project_doc_session(db, session_id, current_user.id)
    existing = await _get_linked_cleaning_session(
        db, session_id, current_user.id, load_messages=True
    )
    if existing:
        project.current_step = "data_engineering"
        project.updated_at = datetime.now(timezone.utc)
        await db.commit()
        result = await db.execute(
            select(WizardSession)
            .where(WizardSession.id == existing.id)
            .options(selectinload(WizardSession.messages))
        )
        return _session_out(result.scalar_one())

    cleaning = WizardSession(
        user_id=current_user.id,
        wizard_type=WizardType.data_clean,
        linked_project_id=session_id,
        title=f"Engenharia de Dados: {project.title}",
        current_step="select_dataset",
    )
    db.add(cleaning)
    project.current_step = "data_engineering"
    project.updated_at = datetime.now(timezone.utc)
    await db.commit()
    result = await db.execute(
        select(WizardSession)
        .where(WizardSession.id == cleaning.id)
        .options(selectinload(WizardSession.messages))
    )
    return _session_out(result.scalar_one())
