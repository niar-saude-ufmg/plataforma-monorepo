import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ACCESS_TOKEN_STORAGE_KEY, SESSION_STORAGE_KEY } from "@niar/auth";
import App from "./App";

describe("Admin App", () => {
  it("redireciona a área administrativa para a home do papel autenticado", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <App mode="admin" currentUser={{ id: 1, name: "Admin", email: "admin@niar.local", role: "admin" }} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Boas vindas, Admin." })).toBeInTheDocument();
  });

  it("redireciona uma rota de outro papel para a home do usuário autenticado", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/administrador/home"]}>
        <App mode="admin" currentUser={{ id: 2, name: "Pesquisador", email: "pesquisador@niar.local", role: "researcher" }} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Boas vindas, Pesquisador." })).toBeInTheDocument();
  });

  it("limpa a sessão local ao sair", async () => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "token-de-teste");
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id: 1 }));

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <App mode="admin" currentUser={{ id: 1, name: "Admin", email: "admin@niar.local", role: "admin" }} />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Sair" }));

    expect(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });
});
