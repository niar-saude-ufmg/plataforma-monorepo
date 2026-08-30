# Plataforma NIAR Monorepo

Estrutura inicial do monorepo da plataforma do NIAR.

Para um passo a passo complementar, ver [GUIA-DE-USO-MONOREPO.md](./GUIA-DE-USO-MONOREPO.md).

## Visão geral

Esta base foi organizada para separar responsabilidades:

- `apps/shell`: rotas, login e composição principal da plataforma
- `apps/admin-web`: frontend administrativo
- `apps/admin-api`: backend administrativo
- `packages/database`: camada central de SQL versionado; o `schema.prisma` e derivado para consumo do admin
- `apps/assistente-api`: backend real do assistente incorporado ao monorepo
- `apps/assistente-web`: frontend real do assistente incorporado ao monorepo

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
pnpm setup
```

Se houver erro de `ERR_PNPM_IGNORED_BUILDS`:

```bash
pnpm approve-builds --all
pnpm setup
```

### Criar `.env`

```bash
cp .env.example .env
```

### Aplicar o SQL versionado da plataforma

Depois de subir o banco:

```bash
pnpm db:apply:sql
```

### Atualizar o schema derivado do Prisma

```bash
pnpm prisma:db:pull
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
- `packages/database/sql/`

Dependências principais:

- `prisma`
- `@prisma/client`
- `pg`

## Desenvolvimento local

### Fluxo normal

```bash
pnpm dev
```

Esse é o comando padrão para trabalhar na plataforma. Ele prepara e serve os remotos federados, inicia a shell e também as APIs necessárias para os fluxos reais:

- shell em `http://localhost:5173`;
- remotos `admin-web` e `assistente-web` carregados pela shell;
- `admin-api` e `assistente-api`.

As portas próprias dos remotos são internas ao desenvolvimento. O acesso funcional deve ser feito pela shell, e não abrindo cada microfrontend separadamente.

### Desenvolvimento isolado

Os comandos abaixo são opcionais e existem apenas para diagnosticar ou desenvolver um módulo sem iniciar toda a plataforma.

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

### Rodar só o assistente-web

```bash
pnpm dev:assistente-web
```

### Rodar só o assistente-api

```bash
cd apps/assistente-api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Credenciais locais de desenvolvimento

Quando o `assistente-api` executa o `seed` em ambiente local, ele cria um usuário admin padrão caso esse usuário ainda não exista no banco.

Credenciais atuais:

- e-mail: `admin@hra.local`
- senha: `admin12345`
- papel: `admin`

Observações:

- essas credenciais existem apenas para desenvolvimento local;
- elas não devem ser reutilizadas em produção;
- se o usuário já existir no banco, o seed não cria outro igual.

## Prisma

### Aplicar SQL local

```bash
pnpm db:apply:sql
```

Observação:

- o SQL versionado é a fonte de verdade das tabelas novas da plataforma;
- o `Prisma` fica como camada de consumo tipado no `admin-api`;
- o `schema.prisma` deve ser tratado como espelho derivado do banco.

### Atualizar o schema derivado

```bash
pnpm prisma:db:pull
```

### Gerar o client

```bash
pnpm prisma:generate
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

- `pnpm setup`: instala dependências Node, prepara a `.venv` do `assistente-api`, cria `.env` se necessário e gera o Prisma Client
- `pnpm db:up`: sobe o banco local no Docker
- `pnpm db:down`: desliga o banco local
- `pnpm db:logs`: mostra os logs do banco
- `pnpm dev`: prepara os remotos federados e sobe shell, APIs e micros necessários à plataforma
- `pnpm dev:shell`: sobe só a shell
- `pnpm dev:admin-web`: sobe só o frontend administrativo
- `pnpm dev:admin-api`: sobe só o backend administrativo
- `pnpm dev:assistente-web`: sobe só o frontend do assistente
- `pnpm prisma:db:pull`: atualiza o `schema.prisma` a partir do banco
- `pnpm prisma:generate`: gera o Prisma Client
- `pnpm db:apply:sql`: aplica o SQL versionado da plataforma
- `pnpm test`: executa os testes principais da base

Essas automações existem para facilitar o uso, mas o fluxo manual continua descrito separadamente para que qualquer pessoa entenda cada etapa.

## Fallback com scripts Node

Se o `pnpm` continuar sendo a origem do problema em algum ambiente:

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
