import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, vi } from "vitest";
import App from "./App";
import { login } from "./services/auth-api";

vi.mock("./services/auth-api", () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn()
}));

afterEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

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

  it("redireciona uma rota protegida para o login", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Login da Plataforma" })).toBeInTheDocument();
  });

  it("autentica pela shell e direciona o perfil para sua área", async () => {
    vi.mocked(login).mockResolvedValue({
      token: "token-de-teste",
      user: {
        id: 3,
        email: "comissao@niar.local",
        full_name: "Comissão NIAR",
        role: "committee",
        is_active: true
      }
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "comissao@niar.local" }
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "senha-segura" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar na plataforma" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("comissao@niar.local", "senha-segura");
    });
  });
});
