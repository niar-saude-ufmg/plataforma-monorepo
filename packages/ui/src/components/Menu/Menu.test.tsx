import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Menu } from "./Menu";

describe("Menu", () => {
  afterEach(() => cleanup());

  it("abre um grupo e executa a ação do item", () => {
    const onClick = vi.fn();
    render(
      <Menu
        groups={[{ label: "Arquivo", items: [{ label: "Editar", onClick }] }]}
      />,
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Arquivo" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Editar" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("troca o conteúdo ao clicar em outro grupo com o menu aberto", () => {
    render(
      <Menu
        groups={[
          { label: "Arquivo", items: [{ label: "Novo" }] },
          { label: "Ajuda", items: [{ label: "Documentação" }] },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Arquivo" }));
    expect(screen.getByRole("menuitem", { name: "Novo" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: "Ajuda" }));
    expect(
      screen.queryByRole("menuitem", { name: "Novo" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Documentação" }),
    ).toBeInTheDocument();
  });
});
