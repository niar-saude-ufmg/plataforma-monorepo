# Assistente API

Este diretório agora contém o backend real do assistente dentro do monorepo.

## Origem

Código trazido de:

```text
/Users/guilherme/Documents/niar/repositorio/assistente/backend
```

## Stack atual

- `Python`
- `FastAPI`
- `SQLAlchemy`
- `PostgreSQL`

## Arquivos locais gerados

Em desenvolvimento local, o assistente grava exports temporários em:

```text
apps/assistente-api/.local/exports
```

Se necessário, esse caminho pode ser sobrescrito pela variável `EXPORTS_DIR` no `.env` da raiz do monorepo.

## Observação importante

Neste primeiro corte, o backend do assistente foi incorporado ao monorepo sem reescrita estrutural.

Ou seja:

- ele continua usando sua stack atual;
- o banco continua compartilhado por referência com a camada SQL central da plataforma;
- as tabelas já existentes do assistente não devem ser alteradas pela camada nova da plataforma.
