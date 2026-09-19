import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Autocomplete } from "./Autocomplete";
describe("Autocomplete", () => {
  it("renderiza o campo de seleção", () => {
    render(<Autocomplete options={["Projeto", "Usuário"]} label="Filtro" />);
    expect(
      screen.getByRole("combobox", { name: "Filtro" }),
    ).toBeInTheDocument();
  });
});
