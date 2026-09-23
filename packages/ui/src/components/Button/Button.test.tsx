import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NiarProvider } from "../../theme/index";
import { Button } from "./Button";

describe("Button", () => {
  it("renderiza com o tema padrão do NiarProvider", () => {
    render(
      <NiarProvider>
        <Button variant="contained">Continuar</Button>
      </NiarProvider>,
    );

    expect(screen.getByRole("button", { name: "Continuar" })).toBeVisible();
  });

  it("preserva o comportamento e as propriedades do botão", () => {
    const onClick = vi.fn();
    render(
      <NiarProvider>
        <Button onClick={onClick}>Salvar</Button>
      </NiarProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
