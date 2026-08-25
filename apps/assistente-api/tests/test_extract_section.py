import asyncio
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.llm.prompts import build_section_draft_instruction
from app.services.wizards.orchestrator import extract_section_content


def test_build_section_draft_instruction_avoids_summary_language():
    instruction = build_section_draft_instruction("objectives")
    assert "NÃO resuma" in instruction
    assert "Extraia e resuma" not in instruction
    assert "terceira pessoa" in instruction
    assert "objectives" in instruction or "Objetivos" in instruction


def test_build_section_draft_instruction_includes_existing_content():
    instruction = build_section_draft_instruction(
        "data_sources",
        existing_content="Fonte A e Fonte B entre 2019 e 2024.",
    )
    assert "Fonte A e Fonte B" in instruction
    assert "Texto já presente" in instruction


def test_extract_section_draft_prompt_sent_to_llm():
    session = SimpleNamespace(
        section_data=json.dumps({"objectives": "Objetivo prévio."}),
        messages=[],
    )
    captured: list[list[dict]] = []

    async def fake_complete_json(messages, **kwargs):
        captured.append(messages)
        return {"content": "Objetivo principal: ...", "complete": True, "missing": []}, None, None, None

    with patch("app.services.wizards.orchestrator.llm_gateway") as gateway:
        gateway.complete_json = AsyncMock(side_effect=fake_complete_json)
        result = asyncio.run(extract_section_content(MagicMock(), session, "objectives"))

    assert result["content"].startswith("Objetivo principal")
    system_contents = [m["content"] for m in captured[0] if m["role"] == "system"]
    combined = "\n".join(system_contents)
    assert "NÃO resuma" in combined
    assert "Objetivo prévio" in combined
    assert "NUNCA inclua raciocínio" in combined


def test_extract_section_endpoint_does_not_persist_section_data():
    from app.api import projects as projects_module

    original_section_data = json.dumps({"objectives": "Antes do extract."})
    session = SimpleNamespace(
        id=1,
        user_id=1,
        section_data=original_section_data,
        messages=[],
    )
    db = MagicMock()
    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = session
    db.execute = AsyncMock(return_value=result_mock)
    db.commit = AsyncMock()

    user = SimpleNamespace(id=1)

    with patch.object(
        projects_module,
        "extract_section_content",
        new_callable=AsyncMock,
        return_value={"content": "Novo rascunho", "complete": False, "missing": ["período"]},
    ):
        response = asyncio.run(
            projects_module.extract_section(
                session_id=1,
                section_key="objectives",
                current_user=user,
                db=db,
            )
        )

    assert response["content"] == "Novo rascunho"
    assert session.section_data == original_section_data
    db.commit.assert_not_called()
