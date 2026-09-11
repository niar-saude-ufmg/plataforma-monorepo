<<<<<<< HEAD
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NiarProvider } from "../../theme/index";
import { Button } from "./Button";

describe("Button", () => {
  it("renderiza com o tema padrão do NiarProvider", () => {
=======
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NiarProvider } from '../../theme/index';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza com o tema padrão do NiarProvider', () => {
>>>>>>> 5ddaf0d (Build initial platform administration flow)
    render(
      <NiarProvider>
        <Button variant="contained">Continuar</Button>
      </NiarProvider>,
    );

<<<<<<< HEAD
    expect(screen.getByRole("button", { name: "Continuar" })).toBeVisible();
  });

  it("preserva o comportamento e as propriedades do botão", () => {
=======
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeVisible();
  });

  it('preserva o comportamento e as propriedades do botão', () => {
>>>>>>> 5ddaf0d (Build initial platform administration flow)
    const onClick = vi.fn();
    render(
      <NiarProvider>
        <Button onClick={onClick}>Salvar</Button>
      </NiarProvider>,
    );

<<<<<<< HEAD
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
=======
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
>>>>>>> 5ddaf0d (Build initial platform administration flow)

    expect(onClick).toHaveBeenCalledOnce();
  });
});
