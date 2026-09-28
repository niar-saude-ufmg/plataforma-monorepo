import os
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage

# A API constrói o grafo no import. A chave fictícia impede que o cliente Gemini
# tente procurar credenciais ADC durante a coleta dos testes; nenhuma chamada
# externa é feita porque o grafo e a busca são substituídos nos testes.
os.environ.setdefault("GOOGLE_API_KEY", "test-key")
os.environ.setdefault("GOOGLE_GENAI_API_KEY", "test-key")

from api import main


client = TestClient(main.app)


@pytest.fixture(autouse=True)
def registros(monkeypatch):
    """Intercepta o log da conversa: nenhum teste grava no Qdrant."""
    capturados = []
    monkeypatch.setattr(main, "log_chat", capturados.append)
    return capturados


def test_healthcheck():
    response = client.get("/api/rag/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_chat_retorna_resposta_e_fontes(monkeypatch):
    ponto = SimpleNamespace(
        score=0.8123,
        payload={
            "title": "Documento de teste",
            "document_type": "Nota técnica",
            "year": 2026,
            "theme": "RAG",
            "source_url": "https://example.com/documento",
            "texto": "Conteúdo do documento.",
            "fonte": "https://example.com/documento",
            "id_original": "doc_teste_abc123",
            "document_id": "doc_teste",
            "page": "3",
        }
    )
    mensagem = AIMessage(content="Resposta baseada no documento.")

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


def test_chat_propaga_erro_quando_integracoes_estao_indisponiveis(monkeypatch, registros):
    monkeypatch.setattr(main, "search_documents", lambda pergunta: (_ for _ in ()).throw(RuntimeError("sem Qdrant")))

    with pytest.raises(RuntimeError, match="sem Qdrant"):
        client.post("/api/rag/chat", json={"pergunta": "Pergunta sem integrações"})

    # O erro também vira registro, sem resposta.
    assert len(registros) == 1
    assert registros[0]["pergunta"] == "Pergunta sem integrações"
    assert registros[0]["resposta"] is None
    assert registros[0]["erro"] == "RuntimeError: sem Qdrant"
    assert registros[0]["buscas"] == []


def test_chat_registra_pergunta_resposta_e_buscas(monkeypatch, registros):
    ponto = SimpleNamespace(
        score=0.81234,
        payload={"id_original": "doc_a_1", "document_id": "doc_a", "title": "Doc A", "page": "2", "texto": "Trecho A."},
    )
    busca_extra = {"consulta": "termo técnico", "trechos": [{"id": "doc_b_1"}]}
    mensagens = [
        HumanMessage(content="pergunta com contexto"),
        AIMessage(content="", tool_calls=[{"name": "retrieve_information", "args": {"query": "termo técnico"}, "id": "c1"}]),
        ToolMessage(content="documentos", tool_call_id="c1", artifact=busca_extra),
        AIMessage(content="Resposta final."),
    ]

    monkeypatch.setattr(main, "search_documents", lambda pergunta: [ponto])
    monkeypatch.setattr(main, "graph", SimpleNamespace(invoke=lambda payload: {"messages": mensagens}))

    response = client.post("/api/rag/chat", json={"pergunta": "Pergunta original"})

    assert response.status_code == 200
    assert len(registros) == 1
    registro = registros[0]
    assert registro["pergunta"] == "Pergunta original"
    assert registro["resposta"] == "Resposta final."
    assert registro["erro"] is None
    assert registro["modelo"] == main.LLM_MODEL
    assert registro["indice"] == main.COLLECTION_NAME
    assert registro["app_versao"] == main.APP_VERSION
    assert registro["momento"].endswith("-03:00")
    assert isinstance(registro["duracao_s"], float)
    assert registro["buscas"] == [
        {
            "consulta": "Pergunta original",
            "trechos": [
                {"id": "doc_a_1", "documento": "doc_a", "titulo": "Doc A", "pagina": "2", "score": 0.8123, "texto": "Trecho A."}
            ],
        },
        busca_extra,
    ]
