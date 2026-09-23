import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stepper } from "./Stepper";
describe("Stepper", () => {
  it("renderiza todas as etapas", () => {
    render(<Stepper steps={["Dados", "Revisão"]} />);
    expect(screen.getByText("Dados")).toBeVisible();
    expect(screen.getByText("Revisão")).toBeVisible();
  });
});
