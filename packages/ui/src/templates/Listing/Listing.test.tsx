import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Listing } from "./Listing";

const columns = [{ key: "name", label: "Projeto" }] as const;
const emptyState = {
  title: "Nenhum projeto cadastrado",
  description: "Cadastre o primeiro projeto para começar.",
  "aria-level": 3,
} as const;

describe("Listing", () => {
  it("renders table rows in ready state", () => {
    render(<Listing columns={columns} rows={[{ name: "Projeto A" }]} emptyState={emptyState} />);
    expect(screen.getByText("Projeto A")).toBeTruthy();
  });

  it("renders loading and empty states", () => {
    const { rerender } = render(<Listing loading columns={columns} emptyState={emptyState} />);
    expect(screen.getByRole("status")).toBeTruthy();
    rerender(<Listing columns={columns} rows={[]} emptyState={emptyState} />);
    expect(screen.getByText("Nenhum projeto cadastrado")).toBeTruthy();
  });
});
