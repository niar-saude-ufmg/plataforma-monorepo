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
pnpm install
```

Se aparecer `ERR_PNPM_IGNORED_BUILDS`:

```bash
pnpm approve-builds --all
pnpm install
```

### 1.4. Criar `.env`

```bash
cp .env.example .env
```

### 1.5. Gerar Prisma

```bash
pnpm prisma:generate
```

### 1.6. Ligar Docker

Se o Docker Desktop não estiver aberto:

```bash
docker desktop start
```

No macOS, alternativa:

```bash
open -a Docker
```

### 1.7. Subir o banco

```bash
pnpm db:up
```

### 1.8. Subir tudo

```bash
pnpm dev
```

### 1.9. Rodar testes

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

## 4. Banco e Prisma

### Gerar o client

```bash
pnpm prisma:generate
```

### Rodar migração local

```bash
pnpm prisma:migrate:dev
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

Dependências principais:

- `prisma`
- `@prisma/client`

## 6. Problemas comuns

### 6.1. `ERR_PNPM_IGNORED_BUILDS`

```bash
pnpm approve-builds --all
pnpm install
```

Depois:

```bash
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
- `pnpm prisma:generate`
- `pnpm prisma:migrate:dev`
- `pnpm test`

Essas automações existem para facilitar o uso, mas o fluxo manual continua documentado separadamente.

## 8. Fallback com Node

Se necessário:

```bash
node ./scripts/setup.mjs
node ./scripts/db-up.mjs
node ./scripts/db-down.mjs
node ./scripts/db-logs.mjs
node ./scripts/dev.mjs
node ./scripts/prisma-generate.mjs
node ./scripts/prisma-migrate-dev.mjs
node ./scripts/test-all.mjs
```
