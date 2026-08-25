from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.wizards.chat_context import messages_for_channel, trim_chat_history
from app.services.wizards.orchestrator import extract_section_content, run_advisory_chat


def _msg(role: str, content: str, channel: str = "intake", section_key: str | None = None):
    return SimpleNamespace(role=role, content=content, channel=channel, section_key=section_key)


def test_messages_for_channel_filters_intake_and_advisory():
    messages = [
        _msg("user", "intake question", "intake"),
        _msg("assistant", "advisory answer", "advisory"),
        _msg("user", "advisory question", "advisory"),
    ]
    assert len(messages_for_channel(messages, "intake")) == 1
    assert len(messages_for_channel(messages, "advisory")) == 2


def test_trim_chat_history_respects_channel():
    messages = [
        _msg("user", "a", "intake"),
        _msg("user", "b", "advisory"),
        _msg("assistant", "c", "advisory"),
    ]
    advisory = trim_chat_history(messages, channel="advisory")
    assert len(advisory) == 2
    assert advisory[0]["content"] == "b"


@pytest.mark.asyncio
async def test_run_advisory_chat_uses_advisory_prompt_not_section_guidance():
    session = SimpleNamespace(
        section_data='{"background": "Contexto do estudo"}',
        messages=[_msg("user", "pergunta anterior", "advisory")],
        llm_model_used="",
    )
    captured: list[list[dict]] = []

    async def fake_complete(messages, **kwargs):
        captured.append(messages)
        return "Resposta consultiva", None, None

    with patch("app.services.wizards.orchestrator.llm_gateway") as gateway:
        gateway.complete = AsyncMock(side_effect=fake_complete)
        gateway.model = "test-model"
        reply = await run_advisory_chat(MagicMock(), session, "Como avaliar AUC?")

    assert reply == "Resposta consultiva"
    system_contents = [m["content"] for m in captured[0] if m["role"] == "system"]
    joined = "\n".join(system_contents)
    assert "consultivo" in joined.lower() or "dúvidas" in joined.lower()
    assert "Seção atual:" not in joined
    assert "Objetivo da seção:" not in joined


@pytest.mark.asyncio
async def test_extract_section_content_ignores_advisory_messages():
    session = SimpleNamespace(
        messages=[
            _msg("user", "conteúdo da coleta", "intake"),
            _msg("assistant", "ok intake", "intake"),
            _msg("user", "dúvida sobre AUC", "advisory"),
            _msg("assistant", "AUC mede…", "advisory"),
        ],
    )
    captured: list[list[dict]] = []

    async def fake_complete_json(messages):
        captured.append(messages)
        return {"content": "extraído", "complete": True, "missing": []}, None, None, None

    with patch("app.services.wizards.orchestrator.llm_gateway") as gateway:
        gateway.complete_json = AsyncMock(side_effect=fake_complete_json)
        result = await extract_section_content(MagicMock(), session, "background")

    assert result["content"] == "extraído"
    user_assistant = [m for m in captured[0] if m["role"] in ("user", "assistant")]
    contents = [m["content"] for m in user_assistant]
    assert "conteúdo da coleta" in contents
    assert "dúvida sobre AUC" not in contents
    assert "AUC mede" not in contents
