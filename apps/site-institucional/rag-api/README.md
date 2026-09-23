# niar-rag-prototype

API de perguntas e respostas (RAG) sobre documentos médico-jurídicos brasileiros.
O núcleo usa **LangGraph** (LLM Groq `openai/gpt-oss-120b`), embeddings **Gemini** e busca
vetorial no **Qdrant**.

> **Esta pasta é uma cópia parcial** do repositório
> [`niar-rag-prototype`](https://github.com/), mantida aqui para o site institucional
> conseguir rodar e implantar a API. Só o **código** é espelhado — o corpus (PDFs em
> `docs/raw/`) e os chunks processados (`data/processed/`) ficam apenas no repo original,
> que é o lugar canônico para mexer no corpus. As alterações devem ser feitas lá e
> re-copiadas para cá.

## Estrutura

```
api/    # API FastAPI (camada de apresentação)
agent/  # agente LangGraph + retrieval (núcleo RAG)
src/    # scripts de indexação (offline; precisam do corpus do repo original)
```

## Configuração

Crie um arquivo `.env` na raiz com:

```
GROQ_API_KEY=...
GOOGLE_GENAI_API_KEY=...
QDRANT_URL=...
QDRANT_API_KEY=...
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

## Rodar a API

Em produção a API só precisa do código acima e das credenciais do Qdrant — a coleção
vetorial já está indexada, então nada de `docs/` ou `data/` é necessário para servir.

```bash
uvicorn api.main:app --reload
```

- Docs interativas: http://127.0.0.1:8000/docs
- Healthcheck: `GET /health`

### Endpoint principal

`POST /chat`

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

## Indexação (rodar ao mudar o corpus)

Estes scripts esperam `docs/raw/` e `data/raw/html/`, que **não estão nesta cópia** —
rode-os no repo `niar-rag-prototype`. Ficam aqui só para referência do pipeline:

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
