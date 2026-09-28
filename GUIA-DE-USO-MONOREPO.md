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

- o `pnpm dev` agora tambem tenta subir `assistente-web`, `assistente-api`, `site-institucional` (`http://localhost:5176`) e `rag-api` (`http://localhost:8001`);
- as `.venv` do `assistente-api` e do `rag-api` sao preparadas automaticamente pelo `pnpm setup` e tambem pelo proprio `pnpm dev`, se necessario;
- o `rag-api` precisa de `GOOGLE_API_KEY`, `GOOGLE_GENAI_API_KEY`, `QDRANT_URL` e `QDRANT_API_KEY` no `.env` para o chat do site responder.

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

- a shell so consegue carregar os micros se `admin-web` e `assistente-web` tambem estiverem ativos como remotes
- a rota `/` da shell redireciona para o site institucional (`VITE_SITE_URL`)

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

### 3.6. Só o site institucional

```bash
pnpm --filter @niar/site-institucional dev
```

Observacao:

- abre em `http://localhost:5176`; o site le o `.env` da raiz (`PUBLIC_RAG_API_URL`) e o chat do `/leme` precisa do `rag-api` ativo

### 3.7. Só o rag-api

```bash
pnpm --filter @niar/rag-api dev
```

Observacao:

- usa o mesmo fluxo do `infra.mjs` do `assistente-api`, na porta `8001` e com prefixo `/api/rag`; docs em `http://localhost:8001/api/rag/docs`

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

### Site institucional

Pacote:

- `apps/site-institucional/package.json`

O site institucional é um app SvelteKit estático servido em `/`. Ele não é um
remote da Module Federation. O assistente da rota `/leme` consome a API
`@niar/rag-api` por `PUBLIC_RAG_API_URL`.

### RAG API

Pacote:

- `apps/rag-api/package.json`
- `apps/rag-api/requirements.txt`

A API é um app FastAPI independente, com prefixo `/api/rag`, porta local `8001`
e container próprio em produção. As dependências de produção ficam pinadas em
`requirements.txt`; as ferramentas de teste ficam em `requirements-dev.txt`.

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

Para verificações estáticas:

```bash
pnpm check
```

Resumo das automações:

- `pnpm setup`
- `pnpm db:up`
- `pnpm db:down`
- `pnpm db:logs`
- `pnpm dev`
- `pnpm prisma:db:pull`
- `pnpm prisma:generate`
- `pnpm db:apply:sql`
- `pnpm test`
- `pnpm check`

Essas automações existem para facilitar o uso, mas o fluxo manual continua documentado separadamente.

## 9. Adicionar um novo projeto ao monorepo

Esta seção é o procedimento de referência para incorporar um novo frontend, backend ou módulo fullstack. Antes de criar arquivos, execute o projeto de origem e faça um inventário de suas rotas, variáveis de ambiente, chamadas HTTP, assets, persistência e dependências. Decida quais responsabilidades continuam no módulo e quais pertencem à shell, ao `admin-api` ou ao banco compartilhado.

### 9.1. Decidir a fronteira do módulo

Use uma aplicação frontend quando o projeto for uma SPA, site estático ou microfrontend que possa ser composto pela shell. Crie uma API apenas quando houver regras de negócio, persistência, processamento ou integração HTTP que não pertençam ao frontend.

Não crie uma API própria para um site institucional estático só porque ele é um projeto separado. O `apps/site-institucional/` é um exemplo de frontend que não é remote: um SvelteKit estático com container próprio, servido pelo Caddy em `/`, fora da Module Federation (que só compõe remotes React). A `rag-api` que ele consome existe por ter processamento próprio (busca vetorial e LLM), não por ser um projeto separado.

Mantenha estas fronteiras:

- `/assistente/*` e outras rotas semelhantes são rotas de microfrontend na shell.
- `/api/assistente/*`, `/api/admin/*` e `/api/rag/*` são prefixos HTTP de APIs.
- Usuários, sessão, projetos e demais entidades centrais devem reutilizar os contratos, a autenticação e o banco compartilhado quando pertencerem ao mesmo domínio.
- O módulo novo não deve duplicar login, usuário, banco ou proxy de outro módulo sem uma justificativa arquitetural registrada.

### 9.2. Incorporar um novo frontend

Crie o app em `apps/<modulo>-web/` e registre-o no workspace com um `package.json` próprio. O pacote deve possuir os scripts mínimos de desenvolvimento, build e teste usados pelo monorepo.

Configure o Vite Module Federation seguindo os remotes existentes. Por exemplo, `apps/admin-web/vite.config.ts` usa `name: "admin"`, gera `remoteEntry.js`, expõe `./App` e compartilha React. O novo frontend deve definir:

```ts
federation({
  name: "meu-modulo",
  filename: "remoteEntry.js",
  exposes: { "./App": "./src/App.tsx" },
  shared: ["react", "react-dom"]
})
```

Se o módulo depender de navegação compartilhada, avalie também `react-router-dom` em `shared`. A entrada exposta deve ser uma composição independente, sem assumir que a shell conhece detalhes internos do módulo.

Reserve uma porta local exclusiva e defina uma variável de remote. As portas atuais são:

| Aplicação | Porta local | Variável/uso |
| --- | ---: | --- |
| shell | 5173 | aplicação principal |
| admin-web | 5174 | `VITE_ADMIN_REMOTE_URL` |
| assistente-web | 5175 | `VITE_ASSISTENTE_REMOTE_URL` |
| site-institucional | 5176 | app próprio, não é remote; a shell leva a ele por `VITE_SITE_URL` |

Para o novo módulo, registre o remote em `apps/shell/vite.config.ts`:

```ts
remotes: {
  meuModulo: env.VITE_MEUMODULO_REMOTE_URL || "http://localhost:4177/assets/remoteEntry.js"
}
```

Adicione a variável ao `.env.example`, ao `apps/shell/Dockerfile.prod` e aos argumentos de build do serviço `shell` em `docker-compose.prod.yml`. Em produção, a URL deve usar o caminho publicado, por exemplo `/remotes/meu-modulo/assets/remoteEntry.js`, e não uma porta local.

Declare o contrato TypeScript em `apps/shell/src/types/federation.d.ts`, usando as props públicas realmente suportadas pelo remote. Depois:

1. carregue o remote por `lazy import` em `apps/shell/src/App.tsx`;
2. inclua a rota no contrato de `packages/config`;
3. defina se a rota é pública ou protegida;
4. aplique as regras de acesso da shell, sem criar um segundo login dentro do microfrontend;
5. configure o remote no `dev:remotes` e no `dev:apps` quando ele precisar subir junto do fluxo raiz;
6. valide carregamento, refresh direto da rota, assets, CSS isolado e navegação pelo shell.

Se o frontend tiver API, configure o proxy local no `vite.config.ts` do próprio app e, quando necessário, na shell. O proxy deve apontar para o prefixo da API correspondente, nunca para a API de outro módulo por conveniência.

Para produção, crie `apps/<modulo>-web/Dockerfile.prod`, use `VITE_REMOTE_BASE=/remotes/<modulo>/` e adicione o serviço em `docker-compose.prod.yml`. Publique os assets no `infra/Caddyfile`:

```caddyfile
handle_path /remotes/meu-modulo/* {
    reverse_proxy meu-modulo-web:80
}
```

O remote precisa responder a `remoteEntry.js`, carregar seus chunks e suportar a URL publicada com a base configurada. Teste também um refresh direto em uma rota interna do módulo.

### 9.3. Incorporar uma nova API

Crie o app em `apps/<modulo>-api/` com seu `package.json`, entrypoint e uma separação clara entre rotas, controllers, services, schemas e repositórios quando o domínio exigir. O `admin-api` atual é a referência TypeScript; o `assistente-api` é a referência Python/FastAPI.

Reserve uma porta local e um prefixo HTTP exclusivo. Por exemplo:

- `admin-api`: porta `3333`, prefixo `/api/admin/*`;
- `assistente-api`: porta `8000`, prefixo `/api/assistente/*`;
- `rag-api`: porta `8001`, prefixo `/api/rag/*`;
- novo módulo: escolha outra porta e use `/api/<modulo>/*`.

Não confunda o prefixo HTTP da API com a rota do microfrontend. Uma tela em `/meu-modulo/*` pode consumir a API em `/api/meu-modulo/*`, mas são superfícies distintas.

Reutilize, quando aplicável:

- `packages/auth` para sessão, token e regras de acesso;
- `packages/contracts` para papéis, status e contratos compartilhados;
- `packages/config` para rotas e configuração comum;
- `packages/database` e o banco compartilhado para entidades do domínio central.

Não copie tabelas de usuários ou sessões para uma nova API. Se o módulo realmente precisar de armazenamento separado, documente a justificativa, os limites de responsabilidade e a estratégia de consistência antes de implementá-lo.

Inclua um healthcheck, contratos de erro acionáveis, validação de entrada e configuração de ambiente. O `admin-api` publica documentação Swagger em `/api/admin/docs`; uma nova API deve oferecer uma forma equivalente de descobrir e validar seus contratos quando isso for útil para o time.

Atualize o desenvolvimento local e os testes:

- script `dev` do novo app;
- `pnpm dev:apps` e os comandos de build/test do workspace;
- proxy local somente quando o frontend precisar chamar a API pela origem da shell;
- testes de autenticação, autorização, validação, isolamento por usuário e erros de infraestrutura.

Para produção, crie `apps/<modulo>-api/Dockerfile.prod`, adicione o serviço em `docker-compose.prod.yml` e configure o proxy no `infra/Caddyfile`:

```caddyfile
handle /api/meu-modulo/* {
    reverse_proxy meu-modulo-api:8080
}
```

O serviço deve usar a URL do banco e os secrets pelo `.env.production`, nunca por valores sensíveis versionados. Valide o healthcheck, autenticação, autorização, CORS/proxy, logs e a URL publicada.

### 9.4. Validar o módulo antes de considerar a integração pronta

Faça a validação em camadas:

1. rode o módulo isoladamente;
2. rode a shell com os remotes ativos;
3. confirme o carregamento do `remoteEntry.js` e dos assets;
4. valide rotas públicas e protegidas com mais de um perfil;
5. teste a API diretamente e pelo proxy da shell;
6. execute `pnpm build` e `pnpm test`;
7. para mudanças que serão publicadas, valide a URL de produção, refresh de SPA, healthchecks e logs.

Confira sempre os arquivos reais de referência antes de copiar uma configuração:

- `apps/shell/vite.config.ts` e `apps/shell/src/types/federation.d.ts`;
- `apps/site-institucional/` e `apps/site-institucional/Dockerfile.prod` para um frontend estático fora da Module Federation;
- `apps/admin-web/vite.config.ts` para um remote com formulário e API;
- `apps/admin-api/src/app.ts` para rotas e documentação de uma API Express;
- `apps/assistente-api/app/main.py` e `apps/rag-api/api/main.py` para prefixos e healthcheck em FastAPI;
- `apps/shell/Dockerfile.prod` e `docker-compose.prod.yml` para build e serviços;
- `infra/Caddyfile` para as rotas públicas de remotes e APIs.

Uma integração está pronta quando uma pessoa nova consegue repetir esse procedimento sem depender de configuração informal, quando os módulos mantêm suas fronteiras e quando nenhum passo incentiva duplicar autenticação, banco ou contrato central.

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
