# @niar/ui

Pacote privado de componentes e fundamentos visuais do monorepo NIAR. As aplicações o consomem com `"@niar/ui": "workspace:*"`; somente os arquivos de `dist` são expostos pelas entradas do pacote.

## Entradas públicas

- `@niar/ui/components`: todos os componentes.
- `@niar/ui/components/Button`: entrada isolada do Button.
- `@niar/ui/tokens`: objeto TypeScript `niar`.
- `@niar/ui/tokens.css`: variáveis CSS.
- `@niar/ui/theme`: tema MUI opcional.
- `@niar/ui`: entrada geral, útil quando não é necessário controlar o recorte importado.

Use o `NiarProvider` uma vez na raiz da aplicação React. Ele encapsula o `ThemeProvider` do MUI e aplica a configuração padrão do NIAR:

```tsx
import { Button } from '@niar/ui/components';
import { NiarProvider } from '@niar/ui/theme';

<NiarProvider>
  <Button color="primary" variant="contained">Continuar</Button>
</NiarProvider>
```

Produtos que precisam de ajustes criam uma variação do tema. Componentes próprios podem consultar o resultado com `useNiarTheme`:

```tsx
import { createNiarTheme, NiarProvider, useNiarTheme } from '@niar/ui/theme';

const theme = createNiarTheme({
  shape: { borderRadius: 12 },
});

<NiarProvider theme={theme}>{/* aplicação */}</NiarProvider>
```

## Estrutura

```text
src/
  components/
    Button/
      Button.tsx
      Button.theme.ts
      Button.test.tsx
      Button.stories.tsx
  foundations/
  theme/
    createNiarTheme.ts
    NiarProvider.tsx
    useNiarTheme.ts
  tokens/
    global.json
    brand.json
    styles/
      tokens.css
      tokens.ts
  main.ts
```

Cada componente mantém implementação, configuração de tema, teste, story e exportação na mesma pasta. `Button.theme.ts`, por exemplo, declara `defaultProps`, estilos e variantes do `MuiButton`. `createNiarTheme` reúne essas configurações; não existe uma segunda árvore `theme/components`.

## Tokens

`global.json` guarda a paleta bruta e as escalas básicas, mas não aparece como prefixo na API pública. `brand.json` atribui papéis de interface a esses valores. Componentes e páginas devem preferir a camada de marca, por exemplo `niar.colors.action.primary` ou `--niar-colors-action-primary`.

O Style Dictionary 5 gera dois arquivos em `src/tokens/styles`:

- `tokens.ts`: objeto resolvido e tipado durante a compilação;
- `tokens.css`: variáveis CSS, preservando os aliases com `var(...)`.

O build compila o TypeScript e copia o CSS para `dist/tokens/styles`. Edite apenas `global.json` ou `brand.json`; `tokens.ts` e `tokens.css` são saídas da geração.

```tsx
import { niar } from '@niar/ui/tokens';

const headingColor = niar.colors.text.heading;
```

```css
@import '@niar/ui/tokens.css';

.project-page {
  color: var(--niar-colors-text-body);
  padding: var(--niar-spacing-xl);
}
```

## Comandos

- `pnpm --filter @niar/ui build`: gera tokens e compila o pacote.
- `pnpm --filter @niar/ui check`: verifica as saídas do Style Dictionary e o TypeScript.
- `pnpm --filter @niar/ui test`: executa os testes dos componentes.
- `pnpm storybook`: inicia o catálogo isolado em `http://localhost:6006`.
- `pnpm storybook:build`: gera o catálogo estático.
- `pnpm dev`: inicia o pacote, Storybook, shell, aplicações e APIs. O catálogo fica disponível pela shell em `/identidade-visual`.

O build de produção da shell incorpora o Storybook em `/storybook/` e apresenta o catálogo na rota pública `/identidade-visual`.
