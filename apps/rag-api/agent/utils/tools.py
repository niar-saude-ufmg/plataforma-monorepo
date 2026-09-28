import os
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.tools import tool   # canônico: langchain.tools só reexporta
                                        # daqui e custa ~25 s a mais no import
from qdrant_client import QdrantClient
import numpy as np
from dotenv import load_dotenv

load_dotenv()

# --- Configurações Globais ---
GEMINI_EMBEDD = True
# Coleção do corpus da Fase 0 (perfil context-v1) embutido com gemini-embedding-001.
# O padrão fica no código porque a coleção está presa ao modelo e ao EMBED_DIM
# abaixo; o env só serve para apontar para uma coleção versionada nova sem deploy.
COLLECTION_NAME = os.getenv("QDRANT_GEMINI_COLLECTION", "leme_gemini")
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
    """Retorna a instância única do modelo de Embedding (Gemini ou Local).

    Guarda o CLIENTE, que não depende da pergunta (modelo, chave, conexão). O
    vetor continua sendo gerado a cada pergunta em get_embedding() — o que se
    reaproveita é só a "linha telefônica", não a "ligação". Construir este
    cliente custa ~1,1 s e não amortiza, então fazê-lo por pergunta era ~1 s de
    latência em toda consulta.
    """
    global _embedding_instance
    if _embedding_instance is None:
        print(f"[SISTEMA] Carregando modelo de embedding ({'Gemini' if GEMINI_EMBEDD else 'Local'})...")
        if GEMINI_EMBEDD:
            _embedding_instance = GoogleGenerativeAIEmbeddings(
                model="gemini-embedding-001",
                task_type="retrieval_query",
            )
        else:
            # Modelo SentenceTransformer (import lazy: só necessário no modo local)
            # ATENÇÃO: all-MiniLM-L6-v2 tem 384 dims e a coleção do Qdrant tem
            # EMBED_DIM=3072 — este ramo falharia na busca. Trocar de modelo
            # exige reindexar.
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
    """Gera o embedding DESTA pergunta, reusando o cliente do Singleton.

    O vetor é novo a cada chamada (é ele que vai buscar no Qdrant); o que não se
    refaz é o cliente.
    """
    model = get_embedding_model()

    if GEMINI_EMBEDD:
        return normalize(model.embed_query(text))

    return model.encode(text).tolist()


# --- Ferramentas (Tools) ---

def search_documents(query: str, limit: int = 5):
    """Busca vetorial no Qdrant e retorna os pontos (chunks) mais relevantes.

    Args:
        query (str): consulta do usuário.
        limit (int): número máximo de chunks retornados. 5 superou 4 nos
            experimentos de recuperação do niar-rag.

    Returns:
        list: lista de pontos do Qdrant (cada um com .payload e .score).
    """
    embedding = get_embedding(query)
    client = get_qdrant_client()

    # SEM `score_threshold`. O 0,60 que ficava aqui era palpite: nenhum
    # experimento o produziu e a avaliação sempre mediu o top-k sem piso, ou
    # seja, media um sistema diferente do que o usuário usava.
    #
    # Similaridade de cosseno entre pergunta e norma não tem escala absoluta:
    # depende do modelo, do idioma e do tamanho do trecho. Um piso fixo descarta
    # em silêncio o trecho de score 0,59 que era a resposta. Se um piso voltar,
    # tem de sair de medição sobre o gabarito (evidência perdida vs. ruído cortado).
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=embedding,
        limit=limit,
    )

    return results.points


def format_context(points, query: str) -> str:
    """Formata os chunks recuperados em texto para injetar no prompt do LLM."""
    if not points:
        return "⚠️ Nenhum documento relevante encontrado na base de dados."

    formatted_docs = []
    for idx, point in enumerate(points, 1):
        texto = point.payload.get('texto', '[Texto não disponível]')
        # 'fonte' no payload é só o nome do arquivo; o link real fica em
        # source_url. Mesmo formato "título — url" usado na avaliação.
        titulo = point.payload.get('title') or point.payload.get('fonte') or '[Fonte não disponível]'
        url = point.payload.get('source_url', '')
        fonte = f"{titulo} — {url}" if url else titulo

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


def summarize_chunks(points) -> list[dict]:
    """Resume os chunks recuperados para o log da conversa (api/chat_log.py).

    Guarda o texto junto do id para o registro continuar legível mesmo depois
    de uma reindexação que tire o chunk da coleção.
    """
    return [
        {
            "id": point.payload.get("id_original", ""),
            "documento": point.payload.get("document_id", ""),
            "titulo": point.payload.get("title") or point.payload.get("fonte") or "",
            "pagina": point.payload.get("page"),
            "score": round(point.score, 4) if point.score is not None else None,
            "texto": point.payload.get("texto", ""),
        }
        for point in points
    ]


# content_and_artifact: o texto vai para o LLM e o artefato (consulta + chunks)
# fica só no ToolMessage, de onde a API tira as buscas extras para o log.
@tool(response_format="content_and_artifact")
def retrieve_information(query: str) -> tuple[str, dict]:
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
        return format_context(points, query), {"consulta": query, "trechos": summarize_chunks(points)}

    except Exception as e:
        error_msg = f"[ERROR] Falha na busca vetorial: {str(e)}"
        print(error_msg)
        return (
            "Desculpe, ocorreu um erro técnico ao buscar os documentos.",
            {"consulta": query, "trechos": [], "erro": str(e)},
        )


TOOLS_CHAT = [
    retrieve_information
]
