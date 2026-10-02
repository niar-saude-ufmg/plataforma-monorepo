"""Registro de cada pergunta e resposta do LEME numa coleção do Qdrant.

Usa o mesmo Qdrant da busca (QDRANT_URL/QDRANT_API_KEY), numa coleção própria e
sem vetores: cada ponto é só o payload do registro. A gravação roda numa thread
à parte e engole qualquer falha — o log nunca pode atrasar nem derrubar o chat.
"""
import os
import threading
import uuid
from datetime import datetime, timedelta, timezone

from qdrant_client import models

from agent.utils.tools import get_qdrant_client


LOG_COLLECTION = os.getenv("QDRANT_LOG_COLLECTION", "leme_logs")

# Versão do app gravada em cada registro, para separar respostas antes e depois
# de uma mudança de prompt, modelo ou índice. Atualizar a cada deploy do rag-api.
APP_VERSION = "2026-09-28"

# Brasília sem horário de verão desde 2019: offset fixo evita depender do tzdata,
# que a imagem python:3.11-slim não traz.
_BRASILIA_TZ = timezone(timedelta(hours=-3), "BRT")

_collection_ready = False
_collection_lock = threading.Lock()


def now() -> str:
    """Momento atual em ISO 8601 com o fuso de Brasília."""
    return datetime.now(_BRASILIA_TZ).isoformat()


def _ensure_collection(client) -> None:
    """Cria a coleção de log (sem vetores) na primeira gravação do processo."""
    global _collection_ready
    with _collection_lock:
        if _collection_ready:
            return
        if not client.collection_exists(LOG_COLLECTION):
            client.create_collection(collection_name=LOG_COLLECTION, vectors_config={})
        _collection_ready = True


def _write(entry: dict) -> None:
    try:
        client = get_qdrant_client()
        _ensure_collection(client)
        client.upsert(
            collection_name=LOG_COLLECTION,
            points=[models.PointStruct(id=str(uuid.uuid4()), vector={}, payload=entry)],
        )
    except Exception as e:
        print(f"[ERROR] Falha ao gravar o log da conversa: {e}")


def log_chat(entry: dict) -> None:
    """Grava o registro em segundo plano, sem bloquear a resposta."""
    threading.Thread(target=_write, args=(entry,), daemon=True).start()
