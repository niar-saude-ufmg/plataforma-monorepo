import os
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

# A API constrói o grafo no import. A chave fictícia impede que o cliente Gemini
# tente procurar credenciais ADC durante a coleta dos testes; nenhuma chamada
# externa é feita porque o grafo e a busca são substituídos nos testes.
os.environ.setdefault("GOOGLE_API_KEY", "test-key")
os.environ.setdefault("GOOGLE_GENAI_API_KEY", "test-key")

from api import main


client = TestClient(main.app)


def test_healthcheck():
    response = client.get("/api/rag/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_chat_retorna_resposta_e_fontes(monkeypatch):
    ponto = SimpleNamespace(
        payload={
            "title": "Documento de teste",
            "document_type": "Nota técnica",
            "year": 2026,
            "theme": "RAG",
            "source_url": "https://example.com/documento",
            "texto": "Conteúdo do documento.",
            "fonte": "https://example.com/documento",
        }
    )
    mensagem = SimpleNamespace(text="Resposta baseada no documento.")

    monkeypatch.setattr(main, "search_documents", lambda pergunta: [ponto])
    monkeypatch.setattr(
        main,
        "graph",
        SimpleNamespace(invoke=lambda payload: {"messages": [mensagem]}),
    )

    response = client.post("/api/rag/chat", json={"pergunta": "O que o documento informa?"})

    assert response.status_code == 200
    assert response.json() == {
        "resposta": "Resposta baseada no documento.",
        "fontes": [
            {
                "titulo": "Documento de teste",
                "tipo": "Nota técnica",
                "ano": "2026",
                "tema": "RAG",
                "link": "https://example.com/documento",
            }
        ],
    }


def test_chat_rejeita_pergunta_acima_do_limite():
    response = client.post("/api/rag/chat", json={"pergunta": "x" * 1001})

    assert response.status_code == 422


def test_chat_propaga_erro_quando_integracoes_estao_indisponiveis(monkeypatch):
    monkeypatch.setattr(main, "search_documents", lambda pergunta: (_ for _ in ()).throw(RuntimeError("sem Qdrant")))

    with pytest.raises(RuntimeError, match="sem Qdrant"):
        client.post("/api/rag/chat", json={"pergunta": "Pergunta sem integrações"})
