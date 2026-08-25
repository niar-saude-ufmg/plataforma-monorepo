#!/usr/bin/env python3
"""Atualiza o ambiente em execução para foco exclusivo no SUS.

- Renomeia/desativa dataset oncológico legado duplicado
- Reaponta sessões de engenharia para o dataset SUS
- Sanitiza section_data e mensagens de chat (atualiza texto, não apaga histórico)
- Atualiza rascunho de script da engenharia demo

Uso:
  cd backend && set -a && source ../.env && set +a
  PYTHONPATH=. python scripts/migrate_sus_only.py
"""
from __future__ import annotations

import asyncio
import json
import re
from pathlib import Path

from sqlalchemy import select, update

from app.core.database import AsyncSessionLocal
from app.models import ChatMessage, Dataset, WizardSession, WizardType
from app.seed import ONCO_DATASET_LEGACY_NAMES, ONCO_DATASET_NAME
from app.services.llm.prompts import PROJECT_DOC_SECTIONS
from app.services.wizards.text_import import split_by_headings
from scripts.bootstrap_onco_scenario import (
    CHAT_THREADS,
    PROJECT_TITLE,
    build_initial_script,
    load_structured_sections,
)

STRUCTURED_MD = Path(__file__).resolve().parents[2] / "docs" / "demo" / "projeto_oncologico_estruturado.md"

SUPLEMENTAR_PATTERNS = [
    r"saúde suplementar",
    r"saude suplementar",
    r"suplementar",
    r"unimed",
    r"operadora de saúde",
    r"operadora de saude",
    r"inter[\-\s]?sistemas?",
    r"dois sistemas de saúde",
    r"dois sistemas",
    r"sus[\-\s]?bh e pela",
    r"público e suplementar",
    r"sus/suplementar",
    r"sus \+ suplementar",
    r"compliance da operadora",
    r"bases suplementares",
    r"fontes suplementares",
]
SUPLEMENTAR_RE = re.compile("|".join(f"({p})" for p in SUPLEMENTAR_PATTERNS), re.IGNORECASE)


def contains_suplementar(text: str) -> bool:
    return bool(text and SUPLEMENTAR_RE.search(text))


def sanitize_text(text: str) -> str:
    if not text.strip():
        return text
    lines = text.splitlines()
    kept: list[str] = []
    for line in lines:
        if contains_suplementar(line):
            continue
        kept.append(line)
    result = "\n".join(kept)
    result = re.sub(r"\n{3,}", "\n\n", result)
    result = re.sub(r"\s{2,}", " ", result)
    return result.strip()


def merge_section(current: str, fresh: str) -> str:
    """Prefer fresh SUS-only template when current still mentions suplementar."""
    if contains_suplementar(current):
        return fresh
    return current


async def _resolve_onco_datasets(db):
    current = await db.execute(select(Dataset).where(Dataset.name == ONCO_DATASET_NAME))
    sus = current.scalar_one_or_none()
    legacy_rows = []
    for name in ONCO_DATASET_LEGACY_NAMES:
        r = await db.execute(select(Dataset).where(Dataset.name == name))
        row = r.scalar_one_or_none()
        if row:
            legacy_rows.append(row)
    return sus, legacy_rows


async def migrate_datasets(db) -> None:
    sus, legacy_rows = await _resolve_onco_datasets(db)
    if not sus and legacy_rows:
        legacy = legacy_rows[0]
        legacy.name = ONCO_DATASET_NAME
        legacy.description = (
            "Coorte sintética de demonstração: pacientes oncológicos atendidos pelo SUS-BH "
            "em Belo Horizonte (2008–2022). Cânceres sólidos: mama, próstata, cólon e pulmão."
        )
        legacy.enabled = True
        sus = legacy
        legacy_rows = legacy_rows[1:]
    if sus:
        sus.enabled = True
        for legacy in legacy_rows:
            await db.execute(
                update(WizardSession)
                .where(WizardSession.dataset_id == legacy.id)
                .values(dataset_id=sus.id)
            )
            legacy.enabled = False
            if legacy.description:
                legacy.description = f"[Descontinuado] {legacy.description}"


async def migrate_demo_project(db) -> None:
    result = await db.execute(
        select(WizardSession).where(WizardSession.title == PROJECT_TITLE)
    )
    project = result.scalar_one_or_none()
    if not project:
        return

    fresh_sections = load_structured_sections(STRUCTURED_MD)
    section_data = json.loads(project.section_data or "{}")

    for key in PROJECT_DOC_SECTIONS:
        current = str(section_data.get(key, "") or "")
        fresh = fresh_sections.get(key, "")
        if key in ("expected_artifacts", "references"):
            section_data[key] = sanitize_text(current) if current.strip() else fresh
        elif contains_suplementar(current):
            section_data[key] = fresh if fresh.strip() else sanitize_text(current)
        elif not current.strip() and fresh.strip():
            section_data[key] = fresh

    project.section_data = json.dumps(section_data, ensure_ascii=False)

    for section_key, thread in CHAT_THREADS.items():
        msgs_result = await db.execute(
            select(ChatMessage)
            .where(
                ChatMessage.session_id == project.id,
                ChatMessage.channel == "intake",
                ChatMessage.section_key == section_key,
            )
            .order_by(ChatMessage.id)
        )
        existing = list(msgs_result.scalars())
        for i, (role, content) in enumerate(thread):
            if i < len(existing) and contains_suplementar(existing[i].content):
                existing[i].content = content
            elif i >= len(existing):
                db.add(
                    ChatMessage(
                        session_id=project.id,
                        role=role,
                        content=content,
                        channel="intake",
                        section_key=section_key,
                    )
                )

    for msg in (
        await db.execute(
            select(ChatMessage).where(
                ChatMessage.session_id == project.id,
                ChatMessage.channel.in_(("intake", "discussion", "advisory")),
            )
        )
    ).scalars():
        if contains_suplementar(msg.content):
            cleaned = sanitize_text(msg.content)
            if cleaned:
                msg.content = cleaned

    cleaning_result = await db.execute(
        select(WizardSession).where(
            WizardSession.linked_project_id == project.id,
            WizardSession.wizard_type == WizardType.data_clean,
        )
    )
    cleaning = cleaning_result.scalar_one_or_none()
    if cleaning:
        cleaning.script_content = build_initial_script()
        for msg in (
            await db.execute(select(ChatMessage).where(ChatMessage.session_id == cleaning.id))
        ).scalars():
            if contains_suplementar(msg.content):
                msg.content = msg.content.replace(
                    "Oncologia BH (SUS + Suplementar)",
                    ONCO_DATASET_NAME,
                )
                msg.content = sanitize_text(msg.content) or msg.content.replace(
                    "SUS + Suplementar", "SUS"
                )


async def migrate_all_section_data(db) -> int:
    updated = 0
    fresh = load_structured_sections(STRUCTURED_MD)
    result = await db.execute(
        select(WizardSession).where(WizardSession.wizard_type == WizardType.project_doc)
    )
    for session in result.scalars():
        if session.title == PROJECT_TITLE:
            continue
        data = json.loads(session.section_data or "{}")
        changed = False
        for key, value in list(data.items()):
            if not isinstance(value, str) or key.startswith("_"):
                continue
            if not contains_suplementar(value):
                continue
            if key in fresh and fresh[key].strip():
                data[key] = merge_section(value, fresh[key])
            else:
                data[key] = sanitize_text(value)
            changed = True
        if changed:
            session.section_data = json.dumps(data, ensure_ascii=False)
            updated += 1
    return updated


async def sanitize_remaining_chats(db) -> int:
    count = 0
    result = await db.execute(select(ChatMessage))
    for msg in result.scalars():
        if not contains_suplementar(msg.content):
            continue
        cleaned = sanitize_text(msg.content)
        if cleaned and cleaned != msg.content:
            msg.content = cleaned
            count += 1
        elif "SUS + Suplementar" in msg.content:
            msg.content = msg.content.replace("SUS + Suplementar", ONCO_DATASET_NAME)
            count += 1
    return count


async def main() -> None:
    async with AsyncSessionLocal() as db:
        await migrate_datasets(db)
        await migrate_demo_project(db)
        other = await migrate_all_section_data(db)
        chats = await sanitize_remaining_chats(db)
        await db.commit()
    print("Migração SUS-only concluída.")
    print(f"  Projetos adicionais sanitizados: {other}")
    print(f"  Mensagens de chat atualizadas: {chats}")


if __name__ == "__main__":
    asyncio.run(main())
