import os
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.tools import tool, ToolRuntime
from qdrant_client import QdrantClient
from google import genai
import numpy as np
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

# --- Configurações Globais ---
GEMINI_EMBEDD = True
COLLECTION_NAME = "niar_rag_documents"
EMBED_DIM = 3072
MODEL_NAME = "gemini-3.1-flash-lite"

# --- SINGLETONS (Gerenciadores de Conexão) ---

# Variáveis globais privadas para armazenar as instâncias
_qdrant_instance = None
_embedding_instance = None
_llm_instance = None

def get_qdrant_client():
    """Retorna a instância única do Qdrant Client."""
    global _qdrant_instance
    if _qdrant_instance is None:
        print("[SISTEMA] Iniciando conexão com Qdrant...")
        _qdrant_instance = QdrantClient(
            url=os.getenv("QDRANT_URL"),
            api_key=os.getenv("QDRANT_API_KEY")
        )
    return _qdrant_instance

def get_embedding_model():
    """Retorna a instância única do modelo de Embedding (Gemini ou Local)."""
    global _embedding_instance
    if _embedding_instance is None:
        print(f"[SISTEMA] Carregando modelo de embedding ({'Gemini' if GEMINI_EMBEDD else 'Local'})...")
        if GEMINI_EMBEDD:
            # Cliente do Google GenAI
            _embedding_instance = genai.Client(api_key=os.getenv("GOOGLE_GENAI_API_KEY"))
        else:
            # Modelo SentenceTransformer (import lazy: só necessário no modo local)
            from sentence_transformers import SentenceTransformer
            EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
            _embedding_instance = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _embedding_instance

def get_llm():
    """Retorna a instância única do LLM."""
    global _llm_instance
    if _llm_instance is None:
        print("[SISTEMA] Iniciando LLM Gemini...")
        _llm_instance = ChatGoogleGenerativeAI(
            api_key=os.getenv("GOOGLE_API_KEY"),
            model=MODEL_NAME,
            temperature=0,
            max_tokens=20000,
            timeout=None,
            max_retries=3,
        )
        # Groq desativado (migração para Gemini):
        # _llm_instance = ChatGroq(
        #     temperature=0,
        #     model_name="qwen/qwen3-32b",
        #     api_key=os.getenv("GROQ_API_KEY"),
        #     max_retries=3,
        #     timeout=None
        # )

    return _llm_instance


# --- Funções Auxiliares ---

def normalize(vec):
    v = np.array(vec)
    norm = np.linalg.norm(v)
    if norm == 0:
        return v.tolist()
    return (v / norm).tolist()

def get_embedding(text: str):
    """Gera o embedding usando a instância Singleton."""
    model = get_embedding_model()
    
    if GEMINI_EMBEDD:
        # 1. Inicializa o gerador de embeddings nativo
        embeddings_model = GoogleGenerativeAIEmbeddings(
            model="gemini-embedding-001",
            task_type="retrieval_query"
        )
        
        # 2. Gera o vetor da pergunta de forma segura
        vetor = embeddings_model.embed_query(text)
        
        # 3. Retorna o vetor normalizado, conforme sua lógica original
        return normalize(vetor)
        
    else:
        return model.encode(text).tolist()
# --- Ferramentas (Tools) ---

def search_documents(query: str, limit: int = 4, score_threshold: float = 0.60):
    """Busca vetorial no Qdrant e retorna os pontos (chunks) mais relevantes.

    Args:
        query (str): consulta do usuário.
        limit (int): número máximo de chunks retornados.
        score_threshold (float): similaridade mínima (0.60 = 60%).

    Returns:
        list: lista de pontos do Qdrant (cada um com .payload e .score).
    """
    embedding = get_embedding(query)
    client = get_qdrant_client()

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=embedding,
        limit=limit,
        score_threshold=score_threshold,
    )

    return results.points


def format_context(points, query: str) -> str:
    """Formata os chunks recuperados em texto para injetar no prompt do LLM."""
    if not points:
        return "⚠️ Nenhum documento relevante encontrado na base de dados."

    formatted_docs = []
    for idx, point in enumerate(points, 1):
        texto = point.payload.get('texto', '[Texto não disponível]')
        fonte = point.payload.get('fonte', '[Fonte não disponível]')

        doc_str = (
            f"📄 DOCUMENTO {idx}:\n"
            f"{texto}\n\n"
            f"🔗 FONTE: {fonte}\n"
            f"{'-'*80}"
        )
        formatted_docs.append(doc_str)

    # separador e docs saem da f-string de propósito: barra invertida dentro das
    # chaves só compila no Python 3.12+, e o servidor roda 3.11. Assim a API
    # funciona em qualquer 3.9+, sem mudar uma vírgula do texto gerado.
    separador = "=" * 80
    docs = "\n".join(formatted_docs)

    return (
        f"\n{separador}\n"
        f"📚 DOCUMENTOS RECUPERADOS PARA: '{query}'\n"
        f"{separador}\n"
        f"{docs}\n"
        f"{separador}\n"
        f"⚠️ IMPORTANTE: Sempre cite a fonte (link) das informações utilizadas.\n"
    )


def extract_sources(points) -> list[dict]:
    """Extrai as fontes dos chunks recuperados como dados estruturados.

    Deduplica por documento (vários chunks do mesmo PDF viram uma única fonte).

    Returns:
        list[dict]: cada item tem titulo, tipo, ano, tema e link.
    """
    sources = {}
    for point in points:
        payload = point.payload
        # chave de deduplicação: link do documento, com fallbacks
        key = payload.get("source_url") or payload.get("title") or payload.get("fonte")
        if not key or key in sources:
            continue

        sources[key] = {
            "titulo": payload.get("title") or payload.get("fonte") or "Documento",
            "tipo": payload.get("document_type") or "",
            "ano": str(payload.get("year") or ""),
            "tema": payload.get("theme") or "",
            "link": payload.get("source_url") or "",
        }

    return list(sources.values())


@tool
def retrieve_information(query: str) -> str:
    """Recupere somente trechos relevantes para responder à consulta do usuário sobre temas médicos ou jurídicos.
    Priorize precisão, contexto e fontes confiáveis.
    Não gere novas informações nem extrapole além do conteúdo recuperado.
    Args:
        query (str): A consulta sobre a qual recuperar informações.

    Returns:
        str: Documentos informativos relevantes formatados sobre sua consulta.
    """

    print(f"[DEBUG] Iniciando busca direta para: {query}")

    try:
        points = search_documents(query)
        return format_context(points, query)

    except Exception as e:
        error_msg = f"[ERROR] Falha na busca vetorial: {str(e)}"
        print(error_msg)
        return "Desculpe, ocorreu um erro técnico ao buscar os documentos."


TOOLS_CHAT = [
    retrieve_information
]