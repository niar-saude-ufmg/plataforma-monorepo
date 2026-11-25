import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Listing } from "./Listing";

const columns = [{ key: "name", label: "Projeto" }] as const;
const emptyState = {
  title: "Nenhum projeto cadastrado",
  description: "Cadastre o primeiro projeto para começar.",
  "aria-level": 3,
} as const;

describe("Listing", () => {
  afterEach(cleanup);
  it("renders table rows in ready state", () => {
    render(<Listing columns={columns} rows={[{ name: "Projeto A" }]} emptyState={emptyState} />);
    expect(screen.getByText("Projeto A")).toBeTruthy();
  });

  it("keeps separate filters available when no rows match", () => {
    const { rerender } = render(
      <Listing separateFilter filter={<input aria-label="Buscar projeto" />} columns={columns} rows={[{ name: "Projeto A" }]} emptyState={emptyState} />,
    );
    const filter = screen.getByRole("textbox", { name: "Buscar projeto" });
    const filterCard = filter.closest(".MuiCard-root");
    expect(filterCard).toBeTruthy();
    expect(filterCard?.contains(screen.getByRole("table"))).toBe(false);

    rerender(<Listing separateFilter filter={<input aria-label="Buscar projeto" />} columns={columns} rows={[]} emptyState={emptyState} />);
    expect(screen.getByRole("textbox", { name: "Buscar projeto" })).toBeTruthy();
    expect(screen.getByText("Nenhum projeto cadastrado")).toBeTruthy();
  });

  it("renders loading and empty states", () => {
    const { rerender } = render(<Listing loading columns={columns} emptyState={emptyState} />);
    expect(screen.getByRole("status")).toBeTruthy();
    rerender(<Listing columns={columns} rows={[]} emptyState={emptyState} />);
    expect(screen.getByText("Nenhum projeto cadastrado")).toBeTruthy();
  });
});
