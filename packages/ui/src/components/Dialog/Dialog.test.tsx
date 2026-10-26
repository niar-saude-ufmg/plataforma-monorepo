import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog";
describe("Dialog", () => {
  it("renderiza título e conteúdo", () => {
    render(
      <Dialog open title="Confirmar">
        Deseja continuar?
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toHaveTextContent("Confirmar");
  });

  it("não fecha ao clicar no overlay quando essa opção está desativada", () => {
    const onClose = vi.fn();

    render(
      <Dialog open closeOnBackdropClick={false} onClose={onClose}>
        Conteúdo
      </Dialog>,
    );

    fireEvent.click(document.querySelector(".MuiBackdrop-root") as HTMLElement);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("não fecha com Escape quando disableEscapeKeyDown está ativo", () => {
    const onClose = vi.fn();

    render(
      <Dialog open disableEscapeKeyDown onClose={onClose}>
        Conteúdo
      </Dialog>,
    );

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
  });
});
