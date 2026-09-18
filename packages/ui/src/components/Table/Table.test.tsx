import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Table } from "./Table";
const columns = [{ key: "name", label: "Nome" }] as const;
describe("Table", () => {
  it("renderiza cabeçalho e linhas", () => {
    render(<Table columns={columns} rows={[{ name: "Projeto" }]} />);
    expect(
      screen.getByRole("columnheader", { name: "Nome" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Projeto" })).toBeInTheDocument();
  });
  it("renderiza estado vazio", () => {
    render(<Table columns={columns} rows={[]} />);
    expect(screen.getByText("Nenhum registro encontrado")).toBeInTheDocument();
  });

  it("renderiza a linha recebida e repassa a seleção ao componente pai", () => {
    const onSelectionChange = vi.fn();

    render(
      <Table
        columns={columns}
        rows={[{ name: "Projeto B" }]}
        selectable
        onSelectionChange={onSelectionChange}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Selecionar linha" }));

    expect(onSelectionChange).toHaveBeenLastCalledWith({ name: "Projeto B" }, true);
  });
});
