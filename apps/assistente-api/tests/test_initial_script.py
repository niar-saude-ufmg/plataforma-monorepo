import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.models import WizardSession, WizardType
from app.services.wizards.orchestrator import generate_initial_clean_script


def _cleaning_session(**kwargs) -> WizardSession:
    session = WizardSession(
        id=1,
        user_id=1,
        wizard_type=WizardType.data_clean,
        linked_project_id=10,
        dataset_id=2,
        current_step="schema_explore",
        title="Test",
        script_content="",
    )
    for key, value in kwargs.items():
        setattr(session, key, value)
    return session


def test_generate_initial_clean_script_requires_dataset():
    session = _cleaning_session(dataset_id=None)
    with pytest.raises(RuntimeError, match="conjunto de dados"):
        asyncio.run(generate_initial_clean_script(MagicMock(), session))


def test_generate_initial_clean_script_requires_linked_project():
    session = _cleaning_session(linked_project_id=None)
    with pytest.raises(RuntimeError, match="projeto vinculado"):
        asyncio.run(generate_initial_clean_script(MagicMock(), session))


@patch("app.services.wizards.orchestrator.get_linked_project_context", new_callable=AsyncMock)
@patch("app.services.wizards.orchestrator.get_schema_context", new_callable=AsyncMock)
@patch("app.services.wizards.orchestrator.llm_gateway")
def test_generate_initial_clean_script_sets_content(mock_gateway, mock_schema, mock_project):
    mock_project.return_value = "- Fontes de Dados: tabela patients"
    mock_schema.return_value = "patients(patient_id)"
    mock_gateway.complete = AsyncMock(
        return_value=("def main():\n    pass\n", 0, 0),
    )
    session = _cleaning_session()
    script = asyncio.run(generate_initial_clean_script(MagicMock(), session))
    assert "def main" in script
    assert session.script_content
    mock_gateway.complete.assert_called_once()
