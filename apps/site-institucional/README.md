# Site Institucional NIAR-Saúde

Site institucional do **NIAR-Saúde** (Núcleo de Inteligência Artificial Responsável para a Saúde), um núcleo interdisciplinar que reúne pesquisadores de computação e saúde para desenvolver soluções voltadas ao uso responsável de dados e inteligência artificial.

## Estrutura do projeto

```
.
├── messages/                    # textos PT/EN (pt.json, en.json) — fonte do i18n
├── project.inlang/              # configuração do i18n (Paraglide)
└── src/
    ├── routes/
    │   ├── +layout.svelte       # layout global (header com navegação, footer)
    │   ├── +layout.ts           # prerender + i18n (trailingSlash)
    │   ├── layout.css           # estilos globais
    │   ├── +page.svelte         # página inicial
    │   ├── about/               # página "Sobre"
    │   ├── team/                # página da equipe (inclui Alumni)
    │   ├── publications/        # página de publicações
    │   └── news/                # notícias
    │       ├── +page.svelte     #   lista de notícias
    │       └── [slug]/          #   artigo interno (notícia própria do NIAR)
    ├── lib/
    │   ├── assets/              # imagens (home, equipe, notícias, logos)
    │   ├── components/
    │   │   ├── HomeNewsCarousel.svelte  # carrossel de notícias da home
    │   │   └── ui/              # componentes de interface
    │   ├── data/
    │   │   ├── publications.ts  # lista de publicações do grupo
    │   │   └── news.ts          # notícias (links externos e artigos internos)
    │   ├── i18n.ts              # utilitário de conteúdo bilíngue (PT/EN)
    │   ├── date.ts              # formatação de datas por idioma
    │   └── paraglide/           # mensagens i18n geradas (não editar à mão)
    └── app.html
```

## Fonte dos dados

As informações exibidas no site — membros da equipe (página `/team`), artigos publicados (página `/publications`) e conteúdo da página "Sobre" — são em grande parte provenientes de uma [planilha interna](https://docs.google.com/spreadsheets/d/1EmYRtFD77KmTbtb34yPHnVO-BeSld9ws5sgHQ2-TtXI/edit?usp=sharing) do grupo e mantidas manualmente nos arquivos de dados e nos componentes Svelte.

## Como rodar

Este app faz parte do monorepo da plataforma (`@niar/site-institucional`). Instale e
configure pelo fluxo da raiz (Node 22, pnpm 11); veja o `README.md` do monorepo.

```sh
pnpm setup                                    # na raiz: instala o workspace e cria o .env
pnpm --filter @niar/site-institucional dev    # http://localhost:5176
pnpm --filter @niar/site-institucional build  # gera o site estático em build/
pnpm --filter @niar/site-institucional check  # svelte-check
```

O `pnpm dev` da raiz também sobe o site junto com o resto da plataforma.

## Assistente LEME (`/assistant`)

O chat chama o `rag-api` (`apps/rag-api`) pelo navegador, em `PUBLIC_RAG_API_URL`,
lida do `.env` da raiz do monorepo (`kit.env.dir` em `svelte.config.js`):

- dev: `http://localhost:8001/api/rag` (suba também `pnpm --filter @niar/rag-api dev`);
- produção: `/api/rag`, na mesma origem, repassado pelo Caddy ao container `rag-api`.

Sem a variável no build de produção, a página entra em modo "em breve" e não faz
nenhuma requisição.

`src/lib/data/corpus.ts` é uma cópia manual de `apps/rag-api/corpus_manifest.csv`, usada
na lista "documentos consultados": atualize os dois juntos.

## Produção

O build (`adapter-static`, pt e en prerenderizados) é servido por um container nginx
(`Dockerfile.prod`), e o Caddy da plataforma encaminha para ele tudo que não é rota da
shell nem de API. Veja `docker-compose.prod.yml` e `infra/Caddyfile` na raiz.
