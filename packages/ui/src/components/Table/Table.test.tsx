import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
