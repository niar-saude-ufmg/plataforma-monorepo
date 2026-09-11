import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createNiarTheme } from './createNiarTheme';
import { NiarProvider } from './NiarProvider';
import { useNiarTheme } from './useNiarTheme';

function ThemeProbe() {
  const theme = useNiarTheme();
  return <span>{theme.palette.primary.main}</span>;
}

describe('tema NIAR', () => {
  it('permite customizar o tema sem perder a configuração dos componentes', () => {
    const theme = createNiarTheme({
      palette: { primary: { main: '#123456' } },
    });

    expect(theme.components?.MuiButton).toBeDefined();

    render(
      <NiarProvider theme={theme}>
        <ThemeProbe />
      </NiarProvider>,
    );

    expect(screen.getByText('#123456')).toBeVisible();
  });
});
