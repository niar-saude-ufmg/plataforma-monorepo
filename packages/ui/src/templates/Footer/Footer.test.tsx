import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";
describe("Footer", () => {
  it("renders editable sections", () => {
    render(<Footer navigation={<nav aria-label="Navegação">Sobre</nav>} information={<span>Contato</span>} />);
    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(screen.getByText("Sobre")).toBeTruthy();
  });
});
