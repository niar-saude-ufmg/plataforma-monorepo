# Plataforma NIAR Monorepo

Estrutura inicial do monorepo da plataforma do NIAR.

Para um passo a passo complementar, ver [GUIA-DE-USO-MONOREPO.md](./GUIA-DE-USO-MONOREPO.md).

## Visão geral

Esta base foi organizada para separar responsabilidades:

- `apps/shell`: rotas, login e composição principal da plataforma
- `apps/admin-web`: frontend administrativo
- `apps/admin-api`: backend administrativo
- `packages/database`: modelo compartilhado do banco via Prisma
- `assistente/`: projeto legado atual do assistente, ainda fora da migração final

## Pré-requisitos

Referência atual do projeto:

- `Node.js 22`
- `pnpm 11`
- `Docker`

## Estrutura

```text
apps/
  shell/
  admin-web/
  admin-api/
  assistente-web/
  assistente-api/
packages/
  auth/
  config/
  contracts/
  database/
assistente/
```

## Instalação de ferramentas

### Node.js

Sugestão:

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

### pnpm

Depois de ativar o `Node 22`:

```bash
npm install -g pnpm@11.19.0
pnpm --version
```

### Docker

Se o Docker ainda não estiver instalado:

- macOS: [Install Docker Desktop on Mac](https://docs.docker.com/desktop/setup/install/mac-install/)
- Windows: [Install Docker Desktop on Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
- Linux: [Install Docker Desktop on Linux](https://docs.docker.com/desktop/setup/install/linux/)

Se o Docker já estiver instalado, mas não estiver rodando:

```bash
docker desktop start
```

No macOS, alternativa:

```bash
open -a Docker
```

## Instalação do projeto

### Instalar dependências do workspace

```bash
cd /Users/guilherme/Documents/niar/repositorio/plataforma
pnpm install
```

Se houver erro de `ERR_PNPM_IGNORED_BUILDS`:

```bash
pnpm approve-builds --all
pnpm install
```

### Criar `.env`

```bash
cp .env.example .env
```

### Gerar o Prisma Client

```bash
pnpm prisma:generate
```

## Banco local

### Subir

```bash
pnpm db:up
```

### Ver logs

```bash
pnpm db:logs
```

### Desligar

```bash
pnpm db:down
```

Se `pnpm db:up` falhar com erro de Docker daemon, o Docker não está em execução.

## Dependências por parte do sistema

### Shell

Local:

- `apps/shell/package.json`

Dependências principais:

- `react`
- `react-dom`
- `react-router-dom`
- `@niar/auth`
- `@niar/config`
- `@niar/contracts`

### Admin Web

Local:

- `apps/admin-web/package.json`

Dependências principais:

- `react`
- `react-dom`
- `@niar/config`
- `@niar/contracts`

### Admin API

Local:

- `apps/admin-api/package.json`

Dependências principais:

- `express`
- `cors`
- `dotenv`
- `zod`
- `@niar/database`
- `@niar/config`
- `@niar/contracts`

### Banco compartilhado

Local:

- `packages/database/package.json`
- `packages/database/prisma/schema.prisma`

Dependências principais:

- `prisma`
- `@prisma/client`

## Como rodar cada parte separadamente

### Rodar tudo

```bash
pnpm dev
```

Isso sobe:

- `shell`
- `admin-web`
- `admin-api`

### Rodar só a shell

```bash
pnpm dev:shell
```

Quando usar:

- trabalho em rotas
- trabalho em login
- trabalho em composição principal

### Rodar só o admin-web

```bash
pnpm dev:admin-web
```

Quando usar:

- trabalho só nas telas administrativas
- trabalho de frontend sem precisar subir tudo

### Rodar só o admin-api

```bash
pnpm dev:admin-api
```

Quando usar:

- trabalho só no backend
- testes de rotas e integração com banco

Se for usar a API, normalmente o banco também precisa estar ativo:

```bash
pnpm db:up
```

## Prisma

### Gerar client novamente

```bash
pnpm prisma:generate
```

### Rodar migração local

```bash
pnpm prisma:migrate:dev
```

## Testes

### Rodar todos os testes principais

```bash
pnpm test
```

## Automação disponível

Além do fluxo manual detalhado acima, o projeto também possui atalhos para facilitar o uso:

```bash
pnpm setup
pnpm db:up
pnpm dev
pnpm test
```

O que cada automação faz:

- `pnpm setup`: instala dependências, cria `.env` se necessário e gera o Prisma Client
- `pnpm db:up`: sobe o banco local no Docker
- `pnpm db:down`: desliga o banco local
- `pnpm db:logs`: mostra os logs do banco
- `pnpm dev`: sobe `shell`, `admin-web` e `admin-api`
- `pnpm dev:shell`: sobe só a shell
- `pnpm dev:admin-web`: sobe só o frontend administrativo
- `pnpm dev:admin-api`: sobe só o backend administrativo
- `pnpm prisma:generate`: gera o Prisma Client
- `pnpm prisma:migrate:dev`: roda migração local de desenvolvimento
- `pnpm test`: executa os testes principais da base

Essas automações existem para facilitar o uso, mas o fluxo manual continua descrito separadamente para que qualquer pessoa entenda cada etapa.

## Fallback com scripts Node

Se o `pnpm` continuar sendo a origem do problema em algum ambiente:

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
