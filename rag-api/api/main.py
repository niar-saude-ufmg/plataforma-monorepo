import re
import unicodedata

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage

from agent.agent import graph
from agent.utils.tools import search_documents, format_context, extract_sources
from api.schemas import ChatRequest, ChatResponse


# Marcadores que o agente usa quando os documentos não sustentam a resposta.
# A primeira frase é ditada literalmente pelo system prompt (agent/utils/prompt.py);
# as demais cobrem paráfrases comuns do modelo. Escritos sem acento porque a
# comparação normaliza o texto antes.
_MARCADORES_SEM_RESPOSTA = (
    "nao encontrei informacoes suficientes",
    "nenhuma fonte encontrada",
    "nao foi possivel encontrar informacoes",
    "nao ha informacoes suficientes",
)


def _normalizar(texto: str) -> str:
    """Minúsculas, sem acento e com espaços colapsados, para casar frases."""
    sem_acento = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", sem_acento).lower()


def _sem_suporte_nas_fontes(resposta: str) -> bool:
    """True quando o agente declarou não ter encontrado base nos documentos."""
    normalizada = _normalizar(resposta)
    return any(marcador in normalizada for marcador in _MARCADORES_SEM_RESPOSTA)


app = FastAPI(
    title="NIAR RAG API",
    description="API de perguntas e respostas sobre documentos médico-jurídicos (RAG).",
    version="1.0.0",
)

# CORS liberado para o front (ex.: app Svelte em outra porta).
# Em produção, restrinja `allow_origins` ao domínio do front.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Healthcheck simples."""
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """Recebe uma pergunta, recupera os documentos relevantes e responde com o agente.

    Retorna a resposta em markdown e as fontes como dados estruturados,
    para o front renderizar (ex.: cards com link clicável).
    """
    pergunta = req.pergunta

    # 1. Recupera os chunks relevantes no Qdrant (uma única busca).
    points = search_documents(pergunta)

    # 2. Monta o contexto textual para o LLM e as fontes estruturadas para o front.
    contexto = format_context(points, pergunta)
    fontes = extract_sources(points)

    # 3. Monta a pergunta com o contexto obrigatório (mesmo fluxo do antigo app.py).
    pergunta_com_contexto = f"""
Use exclusivamente os documentos recuperados abaixo para responder.

Pergunta do usuário:
{pergunta}

Documentos recuperados:
{contexto}

Instruções:
- Responda com base nos documentos recuperados.
- Se os documentos não forem suficientes, diga isso claramente.
- Ao final, inclua uma seção "Fontes utilizadas".
"""

    # 4. Chama o agente (stateless: cada request é independente).
    result = graph.invoke({
        "messages": [HumanMessage(content=pergunta_com_contexto)],
        "confirmation": False,
        "route": None,
        "user_data": None,
        "debug": None,
    })

    # .text (e não .content): o Gemini devolve o conteúdo como lista de blocos
    # (texto + assinaturas de raciocínio), enquanto o Groq devolvia string pura.
    # O .text concatena só as partes de texto, que é o que o front espera.
    resposta = result["messages"][-1].text

    # 5. Se o agente disse que não encontrou base nos documentos, não devolve fonte
    # nenhuma. Os chunks passaram no score_threshold da busca vetorial, mas passar
    # no limiar de similaridade não significa que sustentam a resposta — e exibir
    # cards de fonte embaixo de um "não encontrei" sugere um respaldo que não existe.
    if _sem_suporte_nas_fontes(resposta):
        fontes = []

    return ChatResponse(resposta=resposta, fontes=fontes)
