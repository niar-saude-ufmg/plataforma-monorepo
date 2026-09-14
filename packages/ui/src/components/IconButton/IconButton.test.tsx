import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IconButton } from "./IconButton";
describe("IconButton", () => {
  it("renderiza com nome acessível", () => {
    render(<IconButton name="close" aria-label="Fechar" />);
    expect(screen.getByRole("button", { name: "Fechar" })).toBeVisible();
  });
});
