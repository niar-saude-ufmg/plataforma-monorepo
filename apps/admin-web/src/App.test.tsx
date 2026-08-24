import { render, screen } from "@testing-library/react";
import App from "./App";

describe("Admin web", () => {
  it("mostra o cabeçalho principal do módulo", () => {
    render(<App />);
    expect(screen.getByText("Admin da Plataforma")).toBeInTheDocument();
  });
});
