# Plataforma NIAR Monorepo

Estrutura inicial do monorepo da plataforma do NIAR.

Para um passo a passo complementar, ver [GUIA-DE-USO-MONOREPO.md](./GUIA-DE-USO-MONOREPO.md).

## Visão geral

Esta base foi organizada para separar responsabilidades:

- `apps/shell`: rotas, login e composição principal da plataforma
- `apps/admin-web`: frontend administrativo
- `apps/admin-api`: backend administrativo
- `packages/database`: camada central do banco compartilhado; o SQL versionado fica aqui e o `schema.prisma` e derivado para consumo do admin
- `apps/assistente-api`: backend real do assistente incorporado ao monorepo
- `apps/assistente-web`: frontend real do assistente incorporado ao monorepo

O objetivo e que a base funcione de forma consistente localmente e tambem na VM, mantendo os mesmos micros, as mesmas APIs e o mesmo banco compartilhado.

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

- no macOS, pode abrir com:

```bash
open -a Docker
```

- em Linux ou Windows, iniciar o runtime/container engine pelo método do sistema ou da interface instalada

Na VM Oracle Linux de produção, o padrão do projeto também deve ser `Docker` com `docker compose`. O monorepo não deve depender de `Podman`.

## Instalação do projeto

### Instalar dependências do workspace

```bash
cd <caminho-do-repositorio>/plataforma
pnpm setup
```

O `pnpm setup` agora centraliza a preparação inicial por meio de um único utilitário de infraestrutura:

- instala as dependências Node do monorepo;
- prepara a `.venv` do `assistente-api`;
- cria o `.env` se ele ainda não existir;
- gera o Prisma Client do pacote compartilhado de banco.

Se houver erro de `ERR_PNPM_IGNORED_BUILDS`:

```bash
pnpm approve-builds --all
pnpm setup
```

O workspace ja deixa aprovados os builds necessarios de `prisma` e `esbuild`. Em uma maquina nova, esse comando extra costuma ser necessario apenas na primeira instalacao.

### Criar `.env`

```bash
cp .env.example .env
```

O `EXPORTS_DIR` local ja aponta para `apps/assistente-api/.local/exports`. Se vier um `.env` antigo apontando para `/app`, o assistente agora tenta cair para um diretorio gravavel automaticamente.
Para o Postgres local sem SSL, use `sslmode=disable` na `DATABASE_URL`, como no `.env.example`.

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

## Deploy simples na VM

### Preparar arquivo de ambiente

```bash
cp .env.production.example .env.production
```

Em producao, o arquivo contem duas URLs de banco:

- `DATABASE_URL`: usada pelos scripts executados no host da VM;
- `CONTAINER_DATABASE_URL`: usada pelas APIs quando elas estao dentro dos containers.

No `assistente-api`, a URL assincrona do SQLAlchemy normaliza `sslmode=disable` para compatibilidade com `asyncpg`.

No `docker-compose.prod.yml`, o Postgres de producao fica publicado apenas em `127.0.0.1:5432`, para permitir `pnpm prod:deploy` no host sem expor a porta do banco publicamente.

### Subir stack de producao

```bash
pnpm prod:deploy
```

Esse comando:

- sobe o Postgres;
- espera o Postgres ficar pronto e aplica o SQL versionado em `packages/database/sql`;
- builda shell, micros e APIs pelo `docker compose`;
- recria os containers da stack com proxy reverso.

### Buildar imagens sem subir

```bash
pnpm prod:build
```

Esse comando usa o `docker compose build` da stack de producao.

### Ver logs da stack

```bash
pnpm prod:logs
```

### Derrubar stack de producao

```bash
pnpm prod:down
```

## Publicação com GitHub Actions

O repositório agora possui dois workflows:

- `.github/workflows/ci.yml`: roda em `pull_request` e em `push` para `main` e branches `feat/**`
- `.github/workflows/deploy.yml`: roda em `push` para `main` e também pode ser acionado manualmente por `workflow_dispatch`

### Fluxo recomendado

1. criar branch para a tarefa
2. abrir pull request
3. deixar a `CI` validar `pnpm setup`, `pnpm build` e `pnpm test`
4. aprovar e fazer merge na `main`
5. o workflow de deploy sincroniza o repositório com a VM e executa `pnpm prod:deploy`

### Secrets necessários no GitHub

Cadastrar estes secrets no repositório antes do primeiro deploy:

- `DEPLOY_HOST`: IP ou domínio da VM
- `DEPLOY_PORT`: porta SSH da VM, normalmente `22`
- `DEPLOY_USER`: usuário SSH da VM, por exemplo `opc`
- `DEPLOY_PATH`: diretório do projeto na VM, por exemplo `/home/opc/niar/plataforma`
- `DEPLOY_SSH_KEY`: chave privada usada pelo GitHub Actions para acessar a VM
- `PRODUCTION_ENV_FILE`: conteúdo completo do `.env.production`

### O que a VM precisa ter pronto

Antes do primeiro deploy automático, a VM precisa já ter:

- `nvm`
- `Node 22`
- `pnpm 11`
- `Docker`
- acesso de SSH com a chave configurada no GitHub

Guia complementar:

- `infra/vm/README.md`

### Observações importantes

- o deploy automático foi pensado para acontecer apenas depois do merge na `main`
- o workflow envia o conteúdo do repositório para a VM por `rsync`
- o arquivo `.env.production` não vai para o Git; ele é recriado na VM a partir do secret `PRODUCTION_ENV_FILE`
- o workflow assume que a VM ja foi provisionada corretamente com Docker
- nesta etapa o proxy publica somente `HTTP` na porta `80`; `HTTPS` na `443` só deve voltar quando o Caddy estiver configurado com domínio/certificados

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

Esse é o comando padrão para trabalhar na plataforma. Ele usa `turbo` para orquestrar o monorepo e sobe o ambiente em duas frentes:

- remotos federados de `institucional`, `admin-web` e `assistente-web`;
- shell, `admin-api` e `assistente-api` depois que os remotos ficam disponíveis.

Os fluxos reais ficam acessíveis por:

- shell em `http://localhost:5173`;
- remotos `institucional`, `admin-web` e `assistente-web` carregados pela shell;
- `admin-api` e `assistente-api`.

As portas próprias dos remotos são internas ao desenvolvimento. O acesso funcional deve ser feito pela shell, e não abrindo cada microfrontend separadamente.

### Desenvolvimento isolado

Os comandos abaixo são opcionais e existem apenas para diagnosticar ou desenvolver um módulo sem iniciar toda a plataforma.

### Rodar só a shell

```bash
pnpm --filter @niar/shell dev
```

Quando usar:

- trabalho em rotas
- trabalho em login
- trabalho em composição principal

### Rodar só o admin-web

```bash
pnpm --filter @niar/admin-web dev
```

Quando usar:

- trabalho só nas telas administrativas
- trabalho de frontend sem precisar subir tudo

### Rodar só o admin-api

```bash
pnpm --filter @niar/admin-api dev
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
pnpm --filter @niar/assistente-web dev
```

### Rodar só o assistente-api

```bash
pnpm --filter @niar/assistente-api dev
```

### Rodar só um remoto federado em modo shell

```bash
pnpm --filter @niar/admin-web dev:remote
pnpm --filter @niar/institucional dev:remote
pnpm --filter @niar/assistente-web dev:remote
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

### Fluxo do banco compartilhado

```bash
pnpm db:apply:sql
```

Observação:

- o SQL em `packages/database/sql` e a fonte de verdade estrutural;
- o `Prisma` fica como camada de consumo tipado no `admin-api`;
- o `schema.prisma` deve ser tratado como espelho derivado do banco.

### Como alterar o banco

Quando surgir uma mudanca nova, como adicionar `comissao`, novos status ou novos atributos:

1. editar `packages/database/sql/001_base.sql`
2. aplicar a mudanca no banco local com `pnpm db:apply:sql`
3. atualizar o Prisma com `pnpm prisma:db:pull`
4. regenerar o client com `pnpm prisma:generate`
5. ajustar o `admin-api` para usar os novos campos, tabelas ou relacionamentos
6. ajustar o `assistente-api` se a mudanca afetar models, queries, seed ou integracoes

Exemplos comuns:

- nova coluna em `shared.users`: atualizar o SQL, rodar apply, atualizar Prisma e depois ajustar validação/retorno no `admin-api`
- nova tabela em `admin`: atualizar o SQL, rodar apply, atualizar Prisma e depois criar o uso dela no `admin-api`
- nova tabela ou coluna em `assistant`: atualizar o SQL e depois ajustar os models/queries Python do assistente

Regra prática:

- mudou estrutura do banco: atualizar primeiro o SQL em `packages/database/sql`
- mudou consumo no Node: atualizar depois o Prisma
- mudou consumo no Python: revisar depois os arquivos do `assistente-api`

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

- `pnpm setup`: preparação inicial do workspace inteiro via `scripts/infra.mjs`
- `pnpm db:up`: sobe o banco local com Docker
- `pnpm db:down`: desliga o banco local
- `pnpm db:logs`: mostra os logs do banco
- `pnpm dev`: sobe o ambiente integrado do monorepo usando `turbo`
- `pnpm prisma:db:pull`: atualiza o `schema.prisma` a partir do banco
- `pnpm prisma:generate`: gera o Prisma Client
- `pnpm db:apply:sql`: aplica o SQL versionado da plataforma
- `pnpm prod:build`: builda as imagens de producao com `docker compose`
- `pnpm prod:deploy`: sobe banco, aplica o SQL versionado, builda as imagens e levanta a stack de producao
- `pnpm test`: executa os testes principais da base com `turbo`

Essas automações existem para facilitar o uso, mas o fluxo manual continua descrito separadamente para que qualquer pessoa entenda cada etapa.

## Fallback manual do utilitário de infraestrutura

Se for necessário executar o utilitário diretamente:

```bash
node ./scripts/infra.mjs setup
node ./scripts/infra.mjs db:up
node ./scripts/infra.mjs prisma:db:pull
node ./scripts/infra.mjs prod:deploy
```
