import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ACCESS_TOKEN_STORAGE_KEY, SESSION_STORAGE_KEY } from "@niar/auth";
import { beforeEach, vi } from "vitest";

const specialtyServiceMocks = vi.hoisted(() => ({
  listSpecialties: vi.fn(),
  createSpecialty: vi.fn(),
  updateSpecialty: vi.fn(),
  updateSpecialtyStatus: vi.fn(),
}));

vi.mock("./services/specialties/specialties.service", () => specialtyServiceMocks);

import App from "./App";
import { store } from "./store";
import { clearSpecialtiesState } from "./store/specialties/specialties.slice";

describe("Admin App", () => {
  beforeEach(() => {
    specialtyServiceMocks.listSpecialties.mockReset();
    specialtyServiceMocks.listSpecialties.mockResolvedValue({
      items: [],
      pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
    });
    store.dispatch(clearSpecialtiesState());
  });

  it("redireciona a área administrativa para a home do papel autenticado", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <App mode="admin" currentUser={{ id: 1, name: "Admin", email: "admin@niar.local", role: "admin", accountStatus: "active" }} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Boas vindas, Admin." })).toBeInTheDocument();
  });

  it("redireciona uma rota de outro papel para a home do usuário autenticado", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/administrador/home"]}>
        <App mode="admin" currentUser={{ id: 2, name: "Pesquisador", email: "pesquisador@niar.local", role: "researcher", accountStatus: "active" }} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Boas vindas, Pesquisador." })).toBeInTheDocument();
  });

  it("limpa a sessão local ao sair", async () => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "token-de-teste");
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id: 1 }));

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <App mode="admin" currentUser={{ id: 1, name: "Admin", email: "admin@niar.local", role: "admin", accountStatus: "active" }} />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Sair" }));

    expect(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("permite que o administrador acesse Especialidades pelo menu", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/administrador/home"]}>
        <App mode="admin" currentUser={{ id: 1, name: "Admin", email: "admin@niar.local", role: "admin", accountStatus: "active" }} />
      </MemoryRouter>,
    );

    const specialtiesTab = await screen.findByRole("tab", { name: "Especialidades" });
    fireEvent.click(specialtiesTab);

    expect(await screen.findByRole("heading", { name: "Especialidades" })).toBeInTheDocument();
    expect(specialtyServiceMocks.listSpecialties).toHaveBeenCalled();
  });

  it("permite que o administrador acesse diretamente a rota de Especialidades", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/administrador/especialidades"]}>
        <App mode="admin" currentUser={{ id: 1, name: "Admin", email: "admin@niar.local", role: "admin", accountStatus: "active" }} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Especialidades" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Especialidades" })).toBeInTheDocument();
    expect(specialtyServiceMocks.listSpecialties).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      query: undefined,
      isActive: undefined,
    });
  });

  it.each([
    ["researcher", "Pesquisador", "/admin/pesquisador/home"],
    ["committee", "Comitê", "/admin/comite/home"],
    ["auditor", "Auditor", "/admin/auditor/home"],
  ] as const)("não mostra Especialidades no menu de %s", async (role, name, path) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App mode="admin" currentUser={{ id: 2, name, email: `${role}@niar.local`, role, accountStatus: "active" }} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: `Boas vindas, ${name}.` })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Especialidades" })).not.toBeInTheDocument();
  });

  it("redireciona o pesquisador que tenta acessar a rota administrativa de especialidades", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/administrador/especialidades"]}>
        <App mode="admin" currentUser={{ id: 2, name: "Pesquisador", email: "pesquisador@niar.local", role: "researcher", accountStatus: "active" }} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Boas vindas, Pesquisador." })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Especialidades" })).not.toBeInTheDocument();
    expect(specialtyServiceMocks.listSpecialties).not.toHaveBeenCalled();
  });
});
