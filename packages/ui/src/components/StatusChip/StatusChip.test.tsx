import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusChip } from "./StatusChip";
describe("StatusChip", () => {
  it("renderiza o status informado", () => {
    render(<StatusChip status="success" label="Aprovado" />);
    expect(screen.getByText("Aprovado")).toBeVisible();
  });
});
