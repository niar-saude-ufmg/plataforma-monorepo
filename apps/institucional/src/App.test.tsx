import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("Institucional", () => {
  it("apresenta a entrada para a Sala Segura", () => {
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: /inteligência artificial responsável/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
  });

  it("expõe os acessos de cadastro e assistente", () => {
    render(<MemoryRouter initialEntries={["/sala-segura"]}><App /></MemoryRouter>);
    expect(screen.getByRole("link", { name: "Cadastrar-se como pesquisador" })).toHaveAttribute("href", "/cadastro/pesquisador");
    expect(screen.getByRole("link", { name: "Usar o assistente" })).toHaveAttribute("href", "/assistente");
  });
});
