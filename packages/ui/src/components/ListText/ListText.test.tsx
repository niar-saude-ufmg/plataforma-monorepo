import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ListText } from "./ListText";

describe("ListText", () => {
  it("renderiza os pares de detalhe", () => {
    render(<ListText items={[{ label: "Status", value: "Em análise" }]} />);
    expect(screen.getByRole("list", { name: "Detalhes" })).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Em análise")).toBeInTheDocument();
  });
});
