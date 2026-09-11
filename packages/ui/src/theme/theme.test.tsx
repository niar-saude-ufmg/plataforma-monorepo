<<<<<<< HEAD
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createNiarTheme } from "./createNiarTheme";
import { NiarProvider } from "./NiarProvider";
import { useNiarTheme } from "./useNiarTheme";
=======
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createNiarTheme } from './createNiarTheme';
import { NiarProvider } from './NiarProvider';
import { useNiarTheme } from './useNiarTheme';
>>>>>>> 5ddaf0d (Build initial platform administration flow)

function ThemeProbe() {
  const theme = useNiarTheme();
  return <span>{theme.palette.primary.main}</span>;
}

<<<<<<< HEAD
describe("tema NIAR", () => {
  it("permite customizar o tema sem perder a configuração dos componentes", () => {
    const theme = createNiarTheme({
      palette: { primary: { main: "#123456" } },
=======
describe('tema NIAR', () => {
  it('permite customizar o tema sem perder a configuração dos componentes', () => {
    const theme = createNiarTheme({
      palette: { primary: { main: '#123456' } },
>>>>>>> 5ddaf0d (Build initial platform administration flow)
    });

    expect(theme.components?.MuiButton).toBeDefined();

    render(
      <NiarProvider theme={theme}>
        <ThemeProbe />
      </NiarProvider>,
    );

<<<<<<< HEAD
    expect(screen.getByText("#123456")).toBeVisible();
=======
    expect(screen.getByText('#123456')).toBeVisible();
>>>>>>> 5ddaf0d (Build initial platform administration flow)
  });
});
