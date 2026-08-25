from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.wizards.chat_context import messages_for_channel, trim_chat_history
from app.services.wizards.orchestrator import extract_section_content, run_doc_intake


def _msg(role: str, content: str, channel: str = "intake", section_key: str | None = "background"):
    return SimpleNamespace(role=role, content=content, channel=channel, section_key=section_key)


def test_messages_for_channel_filters_by_section_key():
    messages = [
        _msg("user", "contexto", section_key="background"),
        _msg("assistant", "ok contexto", section_key="background"),
        _msg("user", "métodos", section_key="methods_analysis"),
    ]
    assert len(messages_for_channel(messages, "intake", section_key="background")) == 2
    assert len(messages_for_channel(messages, "intake", section_key="methods_analysis")) == 1
    assert messages_for_channel(messages, "advisory", section_key="background") == []


def test_messages_for_channel_legacy_null_section_key_treated_as_background():
    messages = [_msg("user", "legado", section_key=None)]
    assert len(messages_for_channel(messages, "intake", section_key="background")) == 1
    assert len(messages_for_channel(messages, "intake", section_key="objectives")) == 0


def test_trim_chat_history_respects_section_key():
    messages = [
        _msg("user", "a", section_key="background"),
        _msg("user", "b", section_key="objectives"),
    ]
    history = trim_chat_history(messages, channel="intake", section_key="objectives")
    assert len(history) == 1
    assert history[0]["content"] == "b"


@pytest.mark.asyncio
async def test_run_doc_intake_only_includes_current_section_messages():
    session = SimpleNamespace(
        section_data='{"_current_section": "methods_analysis"}',
        messages=[
            _msg("user", "fale de contexto", section_key="background"),
            _msg("user", "fale de métodos", section_key="methods_analysis"),
        ],
        llm_model_used="",
    )
    captured: list[list[dict]] = []

    async def fake_complete(messages, **kwargs):
        captured.append(messages)
        return "Resposta métodos", None, None

    with patch("app.services.wizards.orchestrator.llm_gateway") as gateway:
        gateway.complete = AsyncMock(side_effect=fake_complete)
        gateway.model = "test-model"
        await run_doc_intake(MagicMock(), session, "mais detalhes")

    user_contents = [m["content"] for m in captured[0] if m["role"] == "user"]
    assert "fale de métodos" in user_contents
    assert "fale de contexto" not in user_contents
    assert "mais detalhes" in user_contents


@pytest.mark.asyncio
async def test_extract_section_content_only_uses_section_thread():
    session = SimpleNamespace(
        messages=[
            _msg("user", "conteúdo contexto", section_key="background"),
            _msg("user", "conteúdo métodos", section_key="methods_analysis"),
            _msg("assistant", "ok métodos", section_key="methods_analysis"),
        ],
    )
    captured: list[list[dict]] = []

    async def fake_complete_json(messages):
        captured.append(messages)
        return {"content": "extraído", "complete": True, "missing": []}, None, None, None

    with patch("app.services.wizards.orchestrator.llm_gateway") as gateway:
        gateway.complete_json = AsyncMock(side_effect=fake_complete_json)
        result = await extract_section_content(MagicMock(), session, "methods_analysis")

    assert result["content"] == "extraído"
    system_contents = [m["content"] for m in captured[0] if m["role"] == "system"]
    combined = "\n".join(system_contents)
    assert "NÃO resuma" in combined
    assert "Extraia e resuma" not in combined
    contents = [m["content"] for m in captured[0] if m["role"] in ("user", "assistant")]
    assert "conteúdo métodos" in contents
    assert "conteúdo contexto" not in contents
