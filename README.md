# Site Institucional NIAR-Saúde

Site institucional do **NIAR-Saúde** (Núcleo de Inteligência Artificial Responsável para a Saúde), um núcleo interdisciplinar que reúne pesquisadores de computação e saúde para desenvolver soluções voltadas ao uso responsável de dados e inteligência artificial.

## Estrutura do projeto

```
src/
├── routes/
│   ├── +layout.svelte       # layout global (header, footer)
│   ├── +page.svelte         # página inicial
│   ├── about/               # página "Sobre"
│   ├── team/                # página da equipe (inclui Alumni)
│   └── publications/        # página de publicações
├── lib/
│   ├── assets/              # imagens (home, fotos da equipe)
│   ├── components/ui/       # componentes de interface
│   └── data/
│       └── publications.ts  # lista de publicações do grupo
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
