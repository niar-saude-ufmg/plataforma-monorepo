import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.models import WizardType
from app.services.wizards.orchestrator import get_linked_project_context
from app.services.wizards.text_import import match_section_heading


def test_match_section_heading_responsible_ai():
    assert match_section_heading("IA Responsável") == "responsible_ai"
    assert match_section_heading("Viés e Explicabilidade") == "responsible_ai"


@pytest.mark.asyncio
async def test_get_linked_project_context_includes_sections():
    project = SimpleNamespace(
        section_data=json.dumps(
            {
                "data_sources": "Tabelas A e B",
                "methods_analysis": "Regressão logística",
                "responsible_ai": "Análise de viés por subgrupo",
            }
        )
    )
    cleaning = SimpleNamespace(
        linked_project_id=1,
        wizard_type=WizardType.data_clean,
    )

    db = MagicMock()
    result = MagicMock()
    result.scalar_one_or_none.return_value = project
    db.execute = AsyncMock(return_value=result)

    context = await get_linked_project_context(db, cleaning)
    assert "Contexto do documento do projeto vinculado" in context
    assert "Tabelas A e B" in context
    assert "Regressão logística" in context
    assert "viés por subgrupo" in context


@pytest.mark.asyncio
async def test_get_linked_project_context_empty_without_link():
    cleaning = SimpleNamespace(linked_project_id=None)
    db = MagicMock()
    context = await get_linked_project_context(db, cleaning)
    assert context == ""
