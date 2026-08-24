import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("Shell App", () => {
  it("renderiza a página pública inicial", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Plataforma NIAR")).toBeInTheDocument();
    expect(screen.getByText("Fazer login")).toBeInTheDocument();
  });
});
