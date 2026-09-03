import os
import tempfile
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ASSISTENTE_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_EXPORTS_DIR = _ASSISTENTE_ROOT / ".local" / "exports"


def _discover_env_file() -> Path | None:
    current = Path(__file__).resolve()

    for parent in current.parents:
        candidate = parent / ".env"
        if candidate.exists():
            return candidate

    return None


_ENV_FILE = _discover_env_file()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE) if _ENV_FILE else ".env",
        extra="ignore",
    )

    app_name: str = "Assistente de Pesquisa em Saúde"
    secret_key: str = "change-me-in-production-use-openssl-rand"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480

    database_url: str = "postgresql+asyncpg://hra:hra_secret@db:5432/hra"
    db_search_path: str = "assistant,shared,admin,public"
    exports_dir: str = str(_DEFAULT_EXPORTS_DIR)

    llm_model: str = "gemini/gemini-3.5-flash"
    llm_model_local: str = "ollama/llama3"
    gemini_api_key: str = ""
    ollama_api_base: str = "http://host.docker.internal:11434"
    local_model_enabled: bool = False
    audit_log_prompts: bool = False
    session_retention_days: int = 90

    max_active_datasets: int = 2
    institution_name: str = "Instituição de Pesquisa"
    allow_registration: bool = False

    cors_origins: str = (
        "http://localhost:5173,"
        "http://localhost:5174,"
        "http://localhost:5175,"
        "http://localhost:3000"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


def get_exports_dir() -> Path:
    settings = get_settings()
    configured = Path(settings.exports_dir).expanduser()
    candidates = [configured]

    if configured != _DEFAULT_EXPORTS_DIR:
        candidates.append(_DEFAULT_EXPORTS_DIR)

    fallback = Path(tempfile.gettempdir()) / "niar-assistente-exports"
    if fallback not in candidates:
        candidates.append(fallback)

    last_error = None

    for candidate in candidates:
        try:
            candidate.mkdir(parents=True, exist_ok=True)
            probe = candidate / ".write-test"
            probe.touch(exist_ok=True)
            probe.unlink(missing_ok=True)
            return candidate
        except OSError as exc:
            last_error = exc

    raise RuntimeError(
        f"Nao foi possivel preparar um diretorio gravavel para exports. Ultimo erro: {last_error}"
    )
