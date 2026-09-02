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
cd <caminho-do-repositorio>/plataforma
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

- no macOS, pode abrir com:

```bash
open -a Docker
```

- em Linux ou Windows, iniciar o runtime/container engine pelo método do sistema ou da interface instalada

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
cd <caminho-do-repositorio>/plataforma
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
pnpm --filter @niar/shell dev
```

Observacao:

- a shell so consegue carregar os micros se `admin-web`, `assistente-web` e `institucional` tambem estiverem ativos como remotes

### 3.2. Só o admin-web

```bash
pnpm --filter @niar/admin-web dev
```

### 3.3. Só o admin-api

```bash
pnpm --filter @niar/admin-api dev
```

Se for usar a API:

```bash
pnpm db:up
```

### 3.4. Só o assistente-web

```bash
pnpm --filter @niar/assistente-web dev
```

### 3.5. Só o assistente-api

```bash
pnpm --filter @niar/assistente-api dev
```

Observacao:

- esse comando usa o fluxo centralizado do `infra.mjs` para garantir a `.venv` e a inicializacao correta do backend Python

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
