# Site Institucional NIAR-Saúde

Site institucional do **NIAR-Saúde** (Núcleo de Inteligência Artificial Responsável para a Saúde), um núcleo interdisciplinar que reúne pesquisadores de computação e saúde para desenvolver soluções voltadas ao uso responsável de dados e inteligência artificial.

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) 2 com [Svelte 5](https://svelte.dev) (runes)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [shadcn-svelte](https://www.shadcn-svelte.com/) / [bits-ui](https://bits-ui.com/) para componentes
- [lucide-svelte](https://lucide.dev/) para ícones
- [Vite](https://vite.dev/) como bundler

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

As informações exibidas no site — membros da equipe (página `/team`), artigos publicados (página `/publications`) e conteúdo da página "Sobre" — são provenientes de uma planilha interna do grupo e mantidas manualmente nos arquivos de dados e nos componentes Svelte.

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

## Outros comandos

| Comando          | Descrição                          |
| ---------------- | ---------------------------------- |
| `npm run check`  | Verifica tipos TypeScript e Svelte |
| `npm run lint`   | Roda Prettier (check) e ESLint     |
| `npm run format` | Formata o código com Prettier      |
