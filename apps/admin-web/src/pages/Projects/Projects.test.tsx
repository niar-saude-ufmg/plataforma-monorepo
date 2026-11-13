import "@testing-library/jest-dom";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../App";
import { store } from "../../store";
import { setSelectedAuthUser } from "../../store/auth/auth.slice";
import { clearProjectsState } from "../../store/projects/projects.slice";
import { getRoleNavigation } from "../../routes/role-routes";
import type { UserRole } from "../../types/user.types";
import { Projects } from "./Projects";
import { AdminMemoryRouter } from "../../test-utils/AdminMemoryRouter";

const fetchMock = vi.hoisted(() => {
  const mock = vi.fn();
  globalThis.fetch = mock as typeof fetch;
  return mock;
});

vi.mock("@niar/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@niar/ui")>();

  const valueOf = (value: unknown) => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && "value" in value) {
      return String((value as { value: unknown }).value);
    }
    return "";
  };

  const Listing = ({
    title,
    description,
    filter,
    columns,
    rows = [],
    loading,
    pagination,
    emptyState,
  }: any) => {
    const hasRows = rows.length > 0;
    return (
      <section data-testid="projects-listing">
        <h1>{title}</h1>
        {hasRows ? <p>{description}</p> : null}
        {loading ? (
          <div role="status" aria-label="Carregando projetos">Carregando</div>
        ) : !hasRows ? (
          <div role="status" aria-label="Lista de registros vazia">
            <h2>{emptyState?.title}</h2>
            <p>{emptyState?.description}</p>
            {emptyState?.action}
          </div>
        ) : (
          <div data-testid="listing-content">
            {filter}
            <table>
              <thead>
                <tr>
                  {columns.map((column: any) => <th key={column.key}>{column.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any) => (
                  <tr key={row.id} data-testid={`project-row-${row.id}`}>
                    {columns.map((column: any) => (
                      <td key={column.key}>
                        {column.render
                          ? column.render(row[column.key], row)
                          : String(row[column.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div data-testid="pagination">
              <span data-testid="pagination-page">{pagination.page}</span>
              <span data-testid="pagination-count">{pagination.count}</span>
              <select
                aria-label="Itens por página"
                value={pagination.rowsPerPage}
                onChange={pagination.onRowsPerPageChange}
              >
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
              <button
                type="button"
                onClick={() => pagination.onPageChange(null, pagination.page + 1)}
              >
                Próxima página
              </button>
            </div>
          </div>
        )}
      </section>
    );
  };

  const Filter = ({ search, values, onChange }: any) => (
    <form aria-label="Filtros de projetos">
      {search.map((field: any) => {
        if (field.key === "search") {
          return (
            <label key={field.key}>
              {field.label}
              <input
                aria-label={field.label}
                value={valueOf(values[field.key])}
                onChange={(event) =>
                  onChange({ ...values, [field.key]: event.target.value || null })
                }
              />
            </label>
          );
        }

        return (
          <label key={field.key}>
            {field.label}
            <select
              aria-label={field.label}
              value={valueOf(values[field.key])}
              onChange={(event) =>
                onChange({
                  ...values,
                  [field.key]:
                    field.options.find((option: any) => option.value === event.target.value) ?? null,
                })
              }
            >
              <option value="">Sem filtro</option>
              {field.options.map((option: any) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        );
      })}
    </form>
  );

  return {
    ...actual,
    Listing,
    Filter,
    StatusChip: ({ label, status }: any) => (
      <span data-testid="status-chip" data-status={status}>{label}</span>
    ),
    Snackbar: ({ open, message, onClose }: any) => open ? (
      <div role="alert">
        {message}
        <button type="button" onClick={onClose}>Fechar erro</button>
      </div>
    ) : null,
  };
});

const PROJECT_RESPONSE = {
  items: [
    {
      id: 42,
      title: "Projeto de pesquisa",
      updated_at: "2026-10-02T12:00:00.000Z",
      researcher: {
        id: 7,
        full_name: "Maria Pesquisadora",
        email: "maria@niar.local",
      },
      status: [
        {
          code: "submitted_to_committee",
          label: "Enviado ao comitê",
          version_number: 1,
          created_at: "2026-09-20T10:00:00.000Z",
          notes: null,
        },
        {
          code: "needs_changes",
          label: "Precisa de alterações",
          version_number: 1,
          created_at: "2026-09-21T10:00:00.000Z",
          notes: null,
        },
      ],
      documents: [
        {
          id: 101,
          version_number: 1,
          document_type: "project_docx",
          original_filename: "projeto-v1.docx",
          created_at: "2026-09-20T10:00:00.000Z",
        },
      ],
      evaluation_status: "to_review",
      evaluations: [],
    },
  ],
  pagination: { page: 1, page_size: 20, total_items: 41, total_pages: 3 },
};

const EMPTY_RESPONSE = {
  items: [],
  pagination: { page: 1, page_size: 20, total_items: 0, total_pages: 0 },
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const projectCalls = () =>
  fetchMock.mock.calls.filter(([url]) => String(url).includes("/api/admin/projects"));

const lastProjectUrl = () => {
  const calls = projectCalls();
  return new URL(String(calls[calls.length - 1][0]), "http://localhost");
};

const authUser = (role: UserRole) => ({
  id: role === "researcher" ? 7 : 1,
  name: {
    admin: "Administrador",
    researcher: "Maria",
    committee: "Comitê",
  }[role],
  email: `${role}@niar.local`,
  role,
  accountStatus: "active" as const,
});

const renderProjects = (role: UserRole = "admin") => {
  store.dispatch(setSelectedAuthUser(authUser(role)));
  return render(
    <Provider store={store}>
      <Projects />
    </Provider>,
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  store.dispatch(clearProjectsState());
  fetchMock.mockReset();
  fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(PROJECT_RESPONSE)));
});

afterEach(() => {
  cleanup();
});

describe("Projects — Redux, filtros e paginação", () => {
  it("faz a busca inicial com página e tamanho do Redux", async () => {
    renderProjects();

    await waitFor(() => expect(projectCalls()).toHaveLength(1));
    expect(lastProjectUrl().searchParams.get("page")).toBe("1");
    expect(lastProjectUrl().searchParams.get("page_size")).toBe("20");
  });

  it("normaliza busca e status, volta para página 1 e remove filtros limpos", async () => {
    const user = userEvent.setup();
    renderProjects();
    await screen.findByTestId("project-row-42");

    fireEvent.change(screen.getByLabelText("Buscar projeto"), {
      target: { value: "42" },
    });
    await waitFor(() => expect(lastProjectUrl().searchParams.get("search")).toBe("42"));
    expect(lastProjectUrl().searchParams.get("page")).toBe("1");

    await user.selectOptions(
      screen.getByLabelText("Status do projeto"),
      "needs_changes",
    );
    await waitFor(() =>
      expect(lastProjectUrl().searchParams.get("status")).toBe(
        "needs_changes",
      ),
    );

    await user.clear(screen.getByLabelText("Buscar projeto"));
    await user.selectOptions(screen.getByLabelText("Status do projeto"), "");
    await waitFor(() => {
      expect(lastProjectUrl().searchParams.has("search")).toBe(false);
      expect(lastProjectUrl().searchParams.has("status")).toBe(false);
    });
  });

  it("mantém os filtros de administrador e pesquisador sem avaliação", async () => {
    renderProjects("admin");
    await screen.findByTestId("project-row-42");
    expect(screen.queryByLabelText("Status da avaliação")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Contexto da avaliação")).not.toBeInTheDocument();
    expect(lastProjectUrl().searchParams.has("evaluation_status")).toBe(false);

    cleanup();
    store.dispatch(clearProjectsState());
    fetchMock.mockClear();
    renderProjects("researcher");
    await screen.findByTestId("project-row-42");

    expect(screen.queryByLabelText("Status da avaliação")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Contexto da avaliação")).not.toBeInTheDocument();
    expect(lastProjectUrl().searchParams.has("evaluation_status")).toBe(false);
  });

  it.each(["committee"] as const)(
    "envia filtros de projeto e avaliação para %s",
    async (role) => {
      const user = userEvent.setup();
      renderProjects(role);
      await screen.findByTestId("project-row-42");

      expect(
        screen.getByRole("option", { name: "Sala segura agendada" }),
      ).toBeInTheDocument();

      await user.selectOptions(
        screen.getByLabelText("Status do projeto"),
        "scheduled_for_safe_room",
      );
      await user.selectOptions(
        screen.getByLabelText("Status da avaliação"),
        "to_review",
      );

      await waitFor(() => {
        expect(lastProjectUrl().searchParams.get("status")).toBe(
          "scheduled_for_safe_room",
        );
        expect(lastProjectUrl().searchParams.get("evaluation_status")).toBe(
          "to_review",
        );
        expect(lastProjectUrl().searchParams.has("evaluation_context")).toBe(false);
      });

      await user.selectOptions(screen.getByLabelText("Status do projeto"), "");
      await user.selectOptions(screen.getByLabelText("Status da avaliação"), "");

      await waitFor(() => {
        expect(lastProjectUrl().searchParams.has("status")).toBe(false);
        expect(lastProjectUrl().searchParams.has("evaluation_status")).toBe(false);
        expect(lastProjectUrl().searchParams.has("evaluation_context")).toBe(false);
      });
    },
  );

  it("converte paginação base 0/base 1 e reseta página ao mudar a quantidade", async () => {
    const user = userEvent.setup();
    renderProjects();
    await screen.findByTestId("project-row-42");

    expect(screen.getByTestId("pagination-page")).toHaveTextContent("0");
    expect(screen.getByTestId("pagination-count")).toHaveTextContent("41");

    await user.click(screen.getByRole("button", { name: "Próxima página" }));
    await waitFor(() => expect(lastProjectUrl().searchParams.get("page")).toBe("2"));

    fireEvent.change(screen.getByLabelText("Itens por página"), { target: { value: "10" } });
    await waitFor(() => {
      expect(lastProjectUrl().searchParams.get("page")).toBe("1");
      expect(lastProjectUrl().searchParams.get("page_size")).toBe("10");
    });
  });
});

describe("Projects — estados e tabela", () => {
  it("usa o loading do Listing enquanto a requisição está pendente", () => {
    fetchMock.mockImplementation(() => new Promise(() => undefined));
    renderProjects();
    expect(screen.getByRole("status", { name: "Carregando projetos" })).toBeInTheDocument();
  });

  it("trata erro global com useApiError e Snackbar", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "Falha" }, 500));
    renderProjects();

    expect(await screen.findByRole("alert")).toHaveTextContent("Erro no servidor. Tente novamente.");
    await userEvent.click(screen.getByRole("button", { name: "Fechar erro" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("exibe o sucesso do download na página", async () => {
    const user = userEvent.setup();
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    fetchMock.mockImplementation((input) => {
      const url = String(input);
      if (url.includes("/documents/101/download")) {
        return Promise.resolve(
          new Response(new Blob(["documento"]), {
            status: 200,
            headers: {
              "Content-Disposition": 'attachment; filename="projeto-v1.docx"',
            },
          }),
        );
      }
      return Promise.resolve(jsonResponse(PROJECT_RESPONSE));
    });
    globalThis.URL.createObjectURL = vi.fn(() => "blob:project-document");
    globalThis.URL.revokeObjectURL = vi.fn();

    renderProjects();
    const row = await screen.findByTestId("project-row-42");
    await user.click(within(row).getByRole("button", { name: "Documentos" }));
    await user.click(
      screen.getByRole("button", { name: "Baixar projeto-v1.docx" }),
    );
    await waitFor(() =>
      expect(store.getState().projects.download.status).toBe("succeeded"),
    );
    await user.click(
      screen.getByRole("button", { name: "Fechar documentos" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Download de projeto-v1.docx concluído.",
    );
    anchorClick.mockRestore();
  });

  it("mantém o download após fechar o dialog e exibe o erro na página", async () => {
    const user = userEvent.setup();
    let resolveDownload!: (response: Response) => void;
    const downloadResponse = new Promise<Response>((resolve) => {
      resolveDownload = resolve;
    });
    fetchMock.mockImplementation((input) =>
      String(input).includes("/documents/101/download")
        ? downloadResponse
        : Promise.resolve(jsonResponse(PROJECT_RESPONSE)),
    );

    renderProjects();
    const row = await screen.findByTestId("project-row-42");
    await user.click(within(row).getByRole("button", { name: "Documentos" }));
    await user.click(
      screen.getByRole("button", { name: "Baixar projeto-v1.docx" }),
    );
    expect(store.getState().projects.download.status).toBe("pending");

    await user.click(
      screen.getByRole("button", { name: "Fechar documentos" }),
    );
    expect(store.getState().projects.download.status).toBe("pending");
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Documentos do projeto" }),
      ).not.toBeInTheDocument(),
    );

    await act(async () => {
      resolveDownload(jsonResponse({ error: "Acesso negado" }, 403));
      await downloadResponse;
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Você não tem acesso a este documento.",
    );
  });

  it.each([
    ["admin" as const, "Ainda não existem projetos para exibir."],
    ["researcher" as const, "Você ainda não possui projetos cadastrados."],
    ["committee" as const, "Ainda não existem projetos disponíveis para avaliação."],
  ])("configura EmptyState sem filtros para %s", async (role, description) => {
    fetchMock.mockResolvedValue(jsonResponse(EMPTY_RESPONSE));
    renderProjects(role);

    expect(await screen.findByRole("heading", { name: "Nenhum projeto cadastrado" })).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it("configura EmptyState filtrado e permite limpar os filtros", async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation((input) => {
      const url = new URL(String(input), "http://localhost");
      return Promise.resolve(jsonResponse(url.searchParams.has("search") ? EMPTY_RESPONSE : PROJECT_RESPONSE));
    });
    renderProjects();
    await screen.findByTestId("project-row-42");

    await user.type(screen.getByLabelText("Buscar projeto"), "inexistente");
    expect(await screen.findByRole("heading", { name: "Nenhum projeto encontrado" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
    await waitFor(() => expect(lastProjectUrl().searchParams.has("search")).toBe(false));
    expect(await screen.findByTestId("project-row-42")).toBeInTheDocument();
  });

  it("usa colunas por papel e abre as ações do projeto selecionado", async () => {
    const user = userEvent.setup();
    renderProjects("admin");
    const row = await screen.findByTestId("project-row-42");

    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual([
      "Projeto",
      "Pesquisador",
      "Status do projeto",

      "Atualizado",

      "Ações",
    ]);
    expect(within(row).getByText("Maria Pesquisadora")).toBeInTheDocument();
    expect(within(row).getByText("Precisa de alterações")).toHaveAttribute(
      "data-status",
      "warning",
    );
    expect(within(row).getByText("02/10/2026")).toBeInTheDocument();

    expect(
      within(row)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Histórico", "Documentos"]);

    await user.click(within(row).getByRole("button", { name: "Histórico" }));
    expect(
      screen.getByRole("heading", { name: "Histórico do projeto" }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("dialog")).getByText("Projeto de pesquisa"),
    ).toBeInTheDocument();
    expect(store.getState().projects.selected?.id).toBe(42);

    await user.click(
      screen.getByRole("button", { name: "Fechar histórico" }),
    );
    expect(store.getState().projects.selected).toBeNull();
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Histórico do projeto" }),
      ).not.toBeInTheDocument(),
    );

    await user.click(
      within(screen.getByTestId("project-row-42")).getByRole("button", {
        name: "Documentos",
      }),
    );
    expect(
      screen.getByRole("heading", { name: "Documentos do projeto" }),
    ).toBeInTheDocument();
    expect(screen.getByText("projeto-v1.docx")).toBeInTheDocument();
    expect(store.getState().projects.selected?.id).toBe(42);

    cleanup();
    store.dispatch(clearProjectsState());
    fetchMock.mockClear();
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        jsonResponse({
          ...PROJECT_RESPONSE,
          items: [
            PROJECT_RESPONSE.items[0],
            {
              ...PROJECT_RESPONSE.items[0],
              id: 43,
              title: "Projeto aprovado para agendamento",
              status: [
                {
                  ...PROJECT_RESPONSE.items[0].status[0],
                  code: "approved_to_schedule",
                  label: "Aprovado para agendar",
                },
              ],
            },
          ],
        }),
      ),
    );
    renderProjects("researcher");
    const researcherRow = await screen.findByTestId("project-row-42");
    const scheduleRow = await screen.findByTestId("project-row-43");
    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual([
      "Projeto",
      "Status",
      "Atualizado",
      "Ações",
    ]);
    expect(screen.queryByText("Maria Pesquisadora")).not.toBeInTheDocument();
    expect(
      within(researcherRow)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Histórico", "Documentos"]);
    expect(
      within(scheduleRow)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Histórico", "Documentos"]);
  });

  it.each(["committee"] as const)(
    "configura colunas e ação visual de %s",
    async (role) => {
      const user = userEvent.setup();
      renderProjects(role);
      const row = await screen.findByTestId("project-row-42");

      expect(
        screen.getAllByRole("columnheader").map((header) => header.textContent),
      ).toEqual([
        "Projeto",
        "Pesquisador",
        "Status do projeto",

        "Status da avaliação",
        "Atualizado",
        "Ações",
      ]);
      expect(within(row).getByText("Maria Pesquisadora")).toBeInTheDocument();
      expect(within(row).getByText("Aguardando avaliação")).toHaveAttribute(
        "data-status",
        "warning",
      );

      expect(
        within(row)
          .getAllByRole("button")
          .map((button) => button.textContent),
      ).toEqual(["Histórico", "Documentos"]);
      await user.click(
        within(row).getByRole("button", { name: "Histórico" }),
      );
      expect(
        screen.getByRole("heading", { name: "Histórico do projeto" }),
      ).toBeInTheDocument();
    },
  );

  it("oculta a ação Documentos quando o projeto não possui documentos", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        ...PROJECT_RESPONSE,
        items: [{ ...PROJECT_RESPONSE.items[0], documents: [] }],
      }),
    );

    renderProjects("committee");
    const row = await screen.findByTestId("project-row-42");

    expect(
      within(row).getByRole("button", { name: "Histórico" }),
    ).toBeInTheDocument();
    expect(
      within(row).queryByRole("button", { name: "Documentos" }),
    ).not.toBeInTheDocument();
  });

  it("exibe Aguardando atribuição quando o projeto ainda não possui avaliação", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        ...PROJECT_RESPONSE,
        items: [
          {
            ...PROJECT_RESPONSE.items[0],
            evaluation_status: "waiting",
            evaluations: [],
          },
        ],
      }),
    );

    renderProjects("committee");
    const row = await screen.findByTestId("project-row-42");

    expect(within(row).getByText("Aguardando atribuição")).toHaveAttribute(
      "data-status",
      "default",
    );
  });

  it("usa somente um Listing, sem estruturas visuais paralelas", async () => {
    renderProjects();
    await screen.findByTestId("project-row-42");
    expect(screen.getAllByTestId("projects-listing")).toHaveLength(1);
  });
});

describe("Projects — rotas e navegação por papel", () => {
  it("adiciona Projetos aos menus dos quatro papéis", () => {
    expect(getRoleNavigation("admin").map(({ label }) => label)).toContain("Projetos");
    expect(getRoleNavigation("researcher").map(({ label }) => label)).toContain("Meus projetos");
    expect(getRoleNavigation("committee").map(({ label }) => label)).toContain("Projetos");
  });

  it.each([
    ["admin" as const, "/admin/administrador/projetos"],
    ["researcher" as const, "/admin/pesquisador/projetos"],
    ["committee" as const, "/admin/comite/projetos"],
  ])("permite a rota de projetos para %s", async (role, path) => {
    render(
      <AdminMemoryRouter initialEntries={[path]}>
        <App currentUser={authUser(role)} />
      </AdminMemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", {
        name: role === "researcher" ? "Meus projetos" : "Projetos",
      }),
    ).toBeInTheDocument();
  });


  it("redireciona pesquisador que tenta acessar a rota de administrador", async () => {
    render(
      <AdminMemoryRouter initialEntries={["/admin/administrador/projetos"]}>
        <App currentUser={authUser("researcher")} />
      </AdminMemoryRouter>,
    );
    expect(await screen.findByRole("heading", { name: "Boas vindas, Maria." })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Projetos" })).not.toBeInTheDocument();
  });
});
