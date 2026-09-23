import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Listing } from "./Listing";

const columns = [{ key: "name", label: "Projeto" }] as const;

describe("Listing", () => {
  it("renders table rows in ready state", () => {
    render(<Listing columns={columns} rows={[{ name: "Projeto A" }]} />);
    expect(screen.getByText("Projeto A")).toBeTruthy();
  });

  it("renders loading and empty states", () => {
    const { rerender } = render(<Listing loading columns={columns} />);
    expect(screen.getByRole("status")).toBeTruthy();
    rerender(<Listing columns={columns} rows={[]} />);
    expect(screen.getByText("Nenhum registro encontrado")).toBeTruthy();
  });
});
