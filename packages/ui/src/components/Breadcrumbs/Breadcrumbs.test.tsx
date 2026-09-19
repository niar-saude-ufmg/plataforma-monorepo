import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "./Breadcrumbs";
describe("Breadcrumbs", () => {
  it("identifica o item atual", () => {
    render(
      <Breadcrumbs
        items={[{ label: "Início", href: "#" }, { label: "Atual" }]}
      />,
    );
    expect(
      screen.getByRole("navigation", { name: "Navegação estrutural" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Atual")).toBeInTheDocument();
  });
});
