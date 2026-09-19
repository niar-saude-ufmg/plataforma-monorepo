import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Form } from "./Form";

describe("Form", () => {
  it("renders heading and children inside a card", () => {
    render(<Form title="Novo projeto"><span>Conteúdo</span></Form>);
    expect(screen.getByRole("heading", { name: "Novo projeto" })).toBeTruthy();
    expect(screen.getByText("Conteúdo")).toBeTruthy();
  });
});
