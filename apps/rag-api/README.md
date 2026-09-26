# rag-api

API de perguntas e respostas (RAG) sobre documentos médico-jurídicos brasileiros, usada
pelo assistente LEME do site institucional (`apps/site-institucional`, rota `/assistant`).
O núcleo usa **LangGraph** (LLM Gemini `gemini-3.7-flash`), embeddings **Gemini** e busca
vetorial no **Qdrant**.

> **Fonte oficial do RAG da plataforma NIAR.** O código da API e do agente é mantido
> aqui, em `apps/rag-api` do monorepo. O repositório `niar-rag-prototype` guarda apenas
> o corpus bruto (PDFs em `docs/raw/`) e os chunks processados (`data/processed/`),
> necessários para rodar os scripts de indexação em `src/`.

## Estrutura

```
api/    # API FastAPI (camada de apresentação)
agent/  # agente LangGraph + retrieval (núcleo RAG)
src/    # scripts de indexação (offline; precisam do corpus do niar-rag-prototype)
```

## Configuração

As variáveis ficam no `.env` da **raiz do monorepo** (o `load_dotenv()` sobe os
diretórios até encontrá-lo). Veja `.env.example`:

```
RAG_API_PORT=8001
RAG_CORS_ORIGINS=http://localhost:5176
GOOGLE_API_KEY=...
GOOGLE_GENAI_API_KEY=...
QDRANT_URL=...
QDRANT_API_KEY=...
```

A `.venv` e as dependências são criadas automaticamente pelo `pnpm setup` (ou na
primeira execução de `dev`/`check`). Os testes usam `requirements-dev.txt`. Para o
LangGraph Studio (`langgraph dev`), instale opcionalmente `requirements-studio.txt`.

## Rodar a API

Em produção a API só precisa do código acima e das credenciais do Qdrant — a coleção
vetorial já está indexada, então nada de `docs/` ou `data/` é necessário para servir.

```bash
pnpm --filter @niar/rag-api dev      # uvicorn com --reload na porta 8001
pnpm --filter @niar/rag-api check    # compileall (usado pelo build do turbo)
pnpm --filter @niar/rag-api test     # testes de contrato da API
```

Todas as rotas ficam sob o prefixo `/api/rag` (convenção `/api/<modulo>/*` do monorepo):

- Docs interativas: http://localhost:8001/api/rag/docs
- Healthcheck: `GET /api/rag/health`

Em produção roda no container `rag-api` (`Dockerfile.prod`), e o Caddy repassa
`/api/rag/*` do domínio público para ele.

### Endpoint principal

`POST /api/rag/chat`

```json
// request
{ "pergunta": "O que é telemedicina segundo a resolução do CFM?" }

// response
{
  "resposta": "## Resposta\n...markdown...",
  "fontes": [
    {
      "titulo": "Resolução CFM nº 2.314/2022",
      "tipo": "Resolução",
      "ano": "2022",
      "tema": "Telemedicina",
      "link": "https://sistemas.cfm.org.br/..."
    }
  ]
}
```

O campo `resposta` vem em markdown; `fontes` é uma lista estruturada (deduplicada por
documento) para o front renderizar como cards com link clicável.

O campo `pergunta` aceita entre 1 e 1000 caracteres. O limite evita que uma entrada
malformada ou excessivamente grande seja enviada ao modelo; proteção de abuso e
limitação de chamadas em produção devem continuar sendo aplicadas na infraestrutura
de borda quando o endpoint estiver exposto publicamente.

## Indexação (rodar ao mudar o corpus)

Estes scripts esperam `docs/raw/` e `data/raw/html/`, que **não são versionados no
monorepo**. Copie o corpus do repo `niar-rag-prototype` para `apps/rag-api/docs/` e
`apps/rag-api/data/` (ignorados pelo git) antes de rodá-los:

```bash
python src/validate_corpus_manifest.py  # confere corpus_manifest.csv vs. PDFs e HTML
python src/extract_to_jsonl.py          # PDFs  -> data/processed/pdf_chunks.jsonl
python src/extract_html_to_jsonl.py     # HTML  -> data/processed/html_chunks.jsonl
python src/merge_corpus_jsonl.py        # junta ambos -> data/processed/documents.jsonl
python src/validate_jsonl.py            # valida os chunks (opcional)
python src/build_vectorstore.py         # gera embeddings e envia ao Qdrant
```

`corpus_manifest.csv` é mantido aqui porque é o índice legível do corpus (63 documentos:
34 PDFs e 29 páginas HTML) e é pequeno.
