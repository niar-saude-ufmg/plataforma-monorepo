import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
