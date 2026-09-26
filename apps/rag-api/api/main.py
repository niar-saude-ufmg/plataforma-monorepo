import os
import re
import unicodedata

from fastapi import APIRouter, FastAPI
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
    # Docs sob o prefixo do módulo, para ficarem acessíveis também via Caddy.
    docs_url="/api/rag/docs",
    openapi_url="/api/rag/openapi.json",
    redoc_url=None,
)

# Origens do front, separadas por vírgula (RAG_CORS_ORIGINS no .env da raiz).
# Em dev o site roda em outra porta (localhost:5176); em produção a chamada é
# same-origin via Caddy, então basta o domínio publicado.
_cors_origins = [
    origem.strip()
    for origem in os.getenv("RAG_CORS_ORIGINS", "http://localhost:5176").split(",")
    if origem.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Prefixo HTTP do módulo, na convenção /api/<modulo>/* do monorepo
# (GUIA-DE-USO-MONOREPO.md, seção 9.3). O Caddy repassa o caminho sem cortar.
router = APIRouter(prefix="/api/rag")


@router.get("/health")
def health():
    """Healthcheck simples."""
    return {"status": "ok"}


@router.post("/chat", response_model=ChatResponse)
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


app.include_router(router)
