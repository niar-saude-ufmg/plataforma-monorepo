import pytest

from app.core.config import get_settings
from app.services.llm.gateway import LLMGateway


@pytest.fixture(autouse=True)
def reset_settings():
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_model_uses_configured_remote_model(monkeypatch):
    monkeypatch.setenv("LOCAL_MODEL_ENABLED", "false")
    monkeypatch.setenv("LLM_MODEL", "gemini/modelo-teste")
    assert LLMGateway().model == "gemini/modelo-teste"


def test_model_switches_to_local_when_enabled(monkeypatch):
    monkeypatch.setenv("LOCAL_MODEL_ENABLED", "true")
    monkeypatch.setenv("LLM_MODEL_LOCAL", "ollama/llama3")
    gateway = LLMGateway()
    assert gateway.model == "ollama/llama3"
    monkeypatch.setenv("LOCAL_MODEL_ENABLED", "false")
    monkeypatch.setenv("LLM_MODEL", "gemini/modelo-remoto")
    get_settings.cache_clear()
    assert gateway.model == "gemini/modelo-remoto"
