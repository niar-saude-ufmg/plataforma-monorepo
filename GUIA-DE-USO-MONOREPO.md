# Guia de Uso do Monorepo

Este guia complementa o `README.md` com um fluxo mais prático para primeira execução e para o dia a dia.

## 1. Primeira vez

### 1.1. Preparar ambiente

Garantir:

- `Node.js 22`
- `pnpm 11`
- `Docker`

### 1.2. Entrar na pasta

```bash
cd /Users/guilherme/Documents/niar/repositorio/plataforma
```

### 1.3. Instalar dependências

```bash
pnpm setup
```

Se aparecer `ERR_PNPM_IGNORED_BUILDS`:

```bash
pnpm approve-builds --all
pnpm setup
```

### 1.4. Criar `.env`

```bash
cp .env.example .env
```

### 1.5. Ligar Docker

Se o Docker Desktop não estiver aberto:

```bash
docker desktop start
```

No macOS, alternativa:

```bash
open -a Docker
```

### 1.6. Subir o banco

```bash
pnpm db:up
```

### 1.7. Aplicar SQL versionado

```bash
pnpm db:apply:sql
```

### 1.8. Atualizar o schema derivado do Prisma

```bash
pnpm prisma:db:pull
pnpm prisma:generate
```

### 1.9. Subir tudo

```bash
pnpm dev
```

Observacao:

- o `pnpm dev` agora tambem tenta subir `assistente-web` e `assistente-api`;
- a `.venv` do `assistente-api` e preparada automaticamente pelo `pnpm setup` e tambem pelo proprio `pnpm dev`, se necessario.

### 1.10. Rodar testes

```bash
pnpm test
```

## 2. Dia a dia

Fluxo mais comum:

```bash
cd /Users/guilherme/Documents/niar/repositorio/plataforma
pnpm db:up
pnpm dev
```

Quando terminar:

```bash
pnpm db:down
```

## 3. Rodando partes separadas

### 3.1. Só a shell

```bash
pnpm dev:shell
```

### 3.2. Só o admin-web

```bash
pnpm dev:admin-web
```

### 3.3. Só o admin-api

```bash
pnpm dev:admin-api
```

Se for usar a API:

```bash
pnpm db:up
```

### 3.4. Só o assistente-web

```bash
pnpm dev:assistente-web
```

### 3.5. Só o assistente-api

```bash
cd apps/assistente-api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 4. Banco, SQL e Prisma

### Atualizar o schema derivado

```bash
pnpm prisma:db:pull
```

### Gerar o client

```bash
pnpm prisma:generate
```

### Aplicar SQL versionado

```bash
pnpm db:apply:sql
```

### Ver logs do banco

```bash
pnpm db:logs
```

### Desligar banco

```bash
pnpm db:down
```

## 5. Dependências por área

### Shell

Pacote:

- `apps/shell/package.json`

Dependências principais:

- `react`
- `react-dom`
- `react-router-dom`
- `@niar/auth`
- `@niar/config`
- `@niar/contracts`

### Admin Web

Pacote:

- `apps/admin-web/package.json`

Dependências principais:

- `react`
- `react-dom`
- `@niar/config`
- `@niar/contracts`

### Admin API

Pacote:

- `apps/admin-api/package.json`

Dependências principais:

- `express`
- `cors`
- `dotenv`
- `zod`
- `@niar/database`

### Database

Pacote:

- `packages/database/package.json`
- `packages/database/sql/`

Dependências principais:

- `prisma`
- `@prisma/client`
- `pg`

## 6. Problemas comuns

### 6.1. `ERR_PNPM_IGNORED_BUILDS`

```bash
pnpm approve-builds --all
pnpm install
```

Depois:

```bash
pnpm prisma:db:pull
pnpm prisma:generate
```

### 6.2. `Cannot connect to the Docker daemon`

Isso significa que o Docker não está em execução.

Tente:

```bash
docker desktop start
```

ou no macOS:

```bash
open -a Docker
```

Depois:

```bash
pnpm db:up
```

## 7. Automação disponível

Se você quiser usar os atalhos do projeto:

```bash
pnpm setup
pnpm db:up
pnpm dev
```

Para testes:

```bash
pnpm test
```

Resumo das automações:

- `pnpm setup`
- `pnpm db:up`
- `pnpm db:down`
- `pnpm db:logs`
- `pnpm dev`
- `pnpm dev:assistente-web`
- `pnpm prisma:db:pull`
- `pnpm prisma:generate`
- `pnpm db:apply:sql`
- `pnpm test`

Essas automações existem para facilitar o uso, mas o fluxo manual continua documentado separadamente.

## 8. Fallback com Node

Se necessário:

```bash
node ./scripts/setup.mjs
node ./scripts/db-up.mjs
node ./scripts/db-down.mjs
node ./scripts/db-logs.mjs
node ./scripts/db-apply-sql.mjs
node ./scripts/prisma-db-pull.mjs
node ./scripts/dev.mjs
node ./scripts/prisma-generate.mjs
node ./scripts/test-all.mjs
```
