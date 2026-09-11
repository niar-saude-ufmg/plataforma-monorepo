import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "./Icon";

describe("Icon", () => {
  it("renderiza o ícone selecionado", () => {
    render(<Icon name="search" titleAccess="Buscar" />);
    expect(screen.getByRole("img", { name: "Buscar" })).toBeVisible();
  });

  it("permite ocultar o ícone decorativo da acessibilidade", () => {
    const { container } = render(<Icon name="search" aria-hidden="true" />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
