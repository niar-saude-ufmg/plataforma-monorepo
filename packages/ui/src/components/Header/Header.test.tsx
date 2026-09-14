import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Header } from "./Header";

describe("Header", () => {
  it("renderiza logo e conteúdo", () => {
    render(
      <Header logo logoAlt="Marca NIAR">
        Navegação
      </Header>,
    );
    expect(screen.getByAltText("Marca NIAR")).toBeInTheDocument();
    expect(screen.getByText("Navegação")).toBeInTheDocument();
  });
});
