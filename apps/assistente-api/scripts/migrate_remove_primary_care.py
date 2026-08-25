#!/usr/bin/env python3
"""Remove menções a dados de atenção primária (e-SUS APS) do ambiente em execução.

Preserva histórico de chat: atualiza textos, não apaga mensagens.

Uso:
  cd backend && set -a && source ../.env && set +a
  PYTHONPATH=. python scripts/migrate_remove_primary_care.py
"""
from __future__ import annotations

import asyncio
import json
import re

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models import ChatMessage, WizardSession, WizardType
from app.services.llm.prompts import PROJECT_DOC_SECTIONS
from scripts.bootstrap_onco_scenario import (
    CHAT_THREADS,
    PROJECT_TITLE,
    load_structured_sections,
)

PRIMARY_CARE_LINE_PATTERNS = [
    r"atenção primária",
    r"atencao primaria",
    r"e-sus aps",
    r"e-sus",
    r"esus aps",
]

PRIMARY_CARE_RE = re.compile("|".join(f"({p})" for p in PRIMARY_CARE_LINE_PATTERNS), re.IGNORECASE)

INLINE_REPLACEMENTS = [
    (re.compile(r"e-SUS APS \(atenção primária\),\s*", re.I), ""),
    (re.compile(r"e-SUS APS \(atencao primaria\),\s*", re.I), ""),
    (re.compile(r"e-SUS,\s*", re.I), ""),
    (re.compile(r"e-SUS APS,\s*", re.I), ""),
    (re.compile(r",?\s*atenção primária", re.I), ""),
    (re.compile(r",?\s*atencao primaria", re.I), ""),
    (re.compile(r"\(APS,\s*", re.I), "("),
    (re.compile(r",\s*APS,", re.I), ","),
    (re.compile(r"entre e-SUS,\s*", re.I), "entre "),
    (re.compile(r"informações da atenção primária,?\s*", re.I), ""),
    (re.compile(r"da atenção primária,?\s*", re.I), ""),
]


def contains_primary_care(text: str) -> bool:
    if not text:
        return False
    if PRIMARY_CARE_RE.search(text):
        return True
    return bool(re.search(r"\bAPS\b", text, re.I) and re.search(r"ambulatorial|e-sus|primária|primaria", text, re.I))


def sanitize_primary_care(text: str) -> str:
    if not text.strip():
        return text
    lines: list[str] = []
    for line in text.splitlines():
        if PRIMARY_CARE_RE.search(line):
            cleaned = line
            for pattern, repl in INLINE_REPLACEMENTS:
                cleaned = pattern.sub(repl, cleaned)
            if PRIMARY_CARE_RE.search(cleaned) or re.search(
                r"\bAPS\b.*ambulatorial|\bAPS\b.*hospitalar", cleaned, re.I
            ):
                continue
            if cleaned.strip():
                lines.append(cleaned.strip())
        else:
            cleaned = line
            for pattern, repl in INLINE_REPLACEMENTS:
                cleaned = pattern.sub(repl, cleaned)
            if cleaned.strip():
                lines.append(cleaned)
    result = "\n".join(lines)
    result = re.sub(r",\s*,", ",", result)
    result = re.sub(r":\s*,", ": ", result)
    result = re.sub(r"\n{3,}", "\n\n", result)
    return result.strip()


async def migrate_sections(db) -> int:
    fresh = load_structured_sections()
    updated = 0
    result = await db.execute(select(WizardSession).where(WizardSession.wizard_type == WizardType.project_doc))
    for session in result.scalars():
        data = json.loads(session.section_data or "{}")
        changed = False
        for key in PROJECT_DOC_SECTIONS:
            value = str(data.get(key, "") or "")
            if not value.strip():
                continue
            if not contains_primary_care(value):
                continue
            if session.title == PROJECT_TITLE and key in fresh and fresh[key].strip():
                data[key] = fresh[key]
            else:
                data[key] = sanitize_primary_care(value)
            changed = True
        if changed:
            session.section_data = json.dumps(data, ensure_ascii=False)
            updated += 1
    return updated


async def migrate_chats(db) -> int:
    count = 0
    demo_id = (
        await db.execute(select(WizardSession.id).where(WizardSession.title == PROJECT_TITLE))
    ).scalar_one_or_none()

    if demo_id:
        for section_key, thread in CHAT_THREADS.items():
            msgs = (
                await db.execute(
                    select(ChatMessage)
                    .where(
                        ChatMessage.session_id == demo_id,
                        ChatMessage.channel == "intake",
                        ChatMessage.section_key == section_key,
                    )
                    .order_by(ChatMessage.id)
                )
            ).scalars()
            for msg, (_, content) in zip(msgs, thread, strict=False):
                if contains_primary_care(msg.content):
                    msg.content = content
                    count += 1

    result = await db.execute(select(ChatMessage))
    for msg in result.scalars():
        if not contains_primary_care(msg.content):
            continue
        cleaned = sanitize_primary_care(msg.content)
        if cleaned and cleaned != msg.content:
            msg.content = cleaned
            count += 1
    return count


async def main() -> None:
    async with AsyncSessionLocal() as db:
        sections = await migrate_sections(db)
        chats = await migrate_chats(db)
        await db.commit()
    print("Remoção de atenção primária concluída.")
    print(f"  Projetos atualizados: {sections}")
    print(f"  Mensagens atualizadas: {chats}")


if __name__ == "__main__":
    asyncio.run(main())
