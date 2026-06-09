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

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior
- npm (vem com o Node)

## Instalação

```sh
npm install
```

## Desenvolvimento

Inicia o servidor de desenvolvimento em `http://localhost:5173`:

```sh
npm run dev
```

Para abrir o navegador automaticamente:

```sh
npm run dev -- --open
```

## Produção

Gera a versão otimizada para produção em `.svelte-kit/output`:

```sh
npm run build
```

Para testar localmente a build de produção:

```sh
npm run preview
```

> O deploy depende do [adapter](https://svelte.dev/docs/kit/adapters) configurado para o ambiente alvo.
