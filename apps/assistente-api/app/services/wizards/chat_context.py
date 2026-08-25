"""Keep conversational LLM prompts small for faster responses."""

from __future__ import annotations

from typing import Optional

from app.models import ChatMessage
from app.services.llm.prompts import PROJECT_DOC_SECTIONS, SECTION_LABELS

CHAT_MAX_HISTORY = 12
CHAT_MAX_MESSAGE_CHARS = 2_000
CHAT_MAX_OUTPUT_TOKENS = 4_096
SECTION_DRAFT_MAX_OUTPUT_TOKENS = 16_384
SECTION_PREVIEW_CHARS = 500
LEGACY_INTAKE_SECTION = PROJECT_DOC_SECTIONS[0]


def truncate_text(text: str, limit: int) -> str:
    cleaned = text.strip()
    if len(cleaned) <= limit:
        return cleaned
    return cleaned[: limit - 1].rstrip() + "…"


def section_context_summary(section_data: dict[str, str]) -> str:
    lines: list[str] = []
    for key in PROJECT_DOC_SECTIONS:
        raw = str(section_data.get(key, "") or "").strip()
        if not raw:
            continue
        label = SECTION_LABELS.get(key, key)
        preview = truncate_text(raw, SECTION_PREVIEW_CHARS)
        lines.append(f"- {key} ({label}): {preview}")
    return "\n".join(lines) if lines else "(nenhuma seção preenchida ainda)"


def message_section_key(msg: ChatMessage) -> Optional[str]:
    return getattr(msg, "section_key", None)


def messages_for_channel(
    messages: list[ChatMessage],
    channel: str,
    *,
    section_key: Optional[str] = None,
) -> list[ChatMessage]:
    filtered = [msg for msg in messages if getattr(msg, "channel", "intake") == channel]
    if section_key is None:
        return filtered
    return [
        msg
        for msg in filtered
        if (message_section_key(msg) or LEGACY_INTAKE_SECTION) == section_key
    ]


def trim_chat_history(
    messages: list[ChatMessage],
    *,
    channel: Optional[str] = None,
    section_key: Optional[str] = None,
    max_messages: int = CHAT_MAX_HISTORY,
    max_chars: int = CHAT_MAX_MESSAGE_CHARS,
) -> list[dict[str, str]]:
    filtered = messages
    if channel is not None:
        filtered = messages_for_channel(messages, channel, section_key=section_key)
    recent = filtered[-max_messages:]
    return [
        {"role": msg.role, "content": truncate_text(msg.content, max_chars)}
        for msg in recent
    ]
