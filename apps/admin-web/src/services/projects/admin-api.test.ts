import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACCESS_TOKEN_STORAGE_KEY } from "@niar/auth";
import {
  getProjectRequest,
  getProjectsRequest,
  normalizeProjectApiError,
  toPagination,
  toProject,
} from "./admin-api";

const rawProjectFromApi = {
  id: 42,
  title: "Pareamento oncológico",
  updated_at: "2026-09-25T12:00:00.000Z",
  researcher: {
    id: 10,
    full_name: "João Silva",
    email: "joao@niar.local",
  },
  status: [
    {
      code: "submitted_to_committee",
      label: "Enviado à comissão",
      version_number: 1,
      created_at: "2026-09-20T10:00:00.000Z",
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
      download_url: "/api/admin/projects/42/documents/101/download",
    },
  ],
  evaluation_status: "waiting",
  evaluations: [
    {
      id: 88,
      version_number: 1,
      result: "to_review",
      responsible_member: {
        user_id: 31,
        full_name: "Avaliador 31",
        email: "committee31@niar.local",
        specialty: { id: 4, name: "Epidemiologia" },
      },
      evaluated_at: null,
      updated_at: "2026-09-22T10:00:00.000Z",
    },
  ],
};

const rawListResponse = {
  items: [rawProjectFromApi],
  pagination: {
    page: 1,
    page_size: 20,
    total_items: 1,
    total_pages: 1,
  },
};

function mockFetchOnce(response: {
  ok: boolean;
  status: number;
  json?: () => Promise<unknown>;
}) {
  const fetchMock = vi.fn().mockResolvedValueOnce({
    ok: response.ok,
    status: response.status,
    json: response.json ?? (async () => undefined),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("admin-api projects service", () => {
  beforeEach(() => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "fake-token");
    vi.stubEnv("VITE_ADMIN_API_URL", "http://localhost:3333/api/admin");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  describe("toProject", () => {
    it("converte todos os campos para camelCase", () => {
      const project = toProject(rawProjectFromApi);

      expect(project).toEqual({
        id: 42,
        title: "Pareamento oncológico",
        updatedAt: "2026-09-25T12:00:00.000Z",
        researcher: {
          id: 10,
          fullName: "João Silva",
          email: "joao@niar.local",
        },
        status: [
          {
            code: "submitted_to_committee",
            label: "Enviado à comissão",
            versionNumber: 1,
            createdAt: "2026-09-20T10:00:00.000Z",
            notes: null,
          },
        ],
        documents: [
          {
            id: 101,
            versionNumber: 1,
            documentType: "project_docx",
            originalFilename: "projeto-v1.docx",
            createdAt: "2026-09-20T10:00:00.000Z",
            downloadUrl: "/api/admin/projects/42/documents/101/download",
          },
        ],
        evaluationStatus: "waiting",
        evaluations: [
          {
            id: 88,
            versionNumber: 1,
            result: "to_review",
            responsibleMember: {
              userId: 31,
              fullName: "Avaliador 31",
              email: "committee31@niar.local",
              specialty: { id: 4, name: "Epidemiologia" },
            },
            evaluatedAt: null,
            updatedAt: "2026-09-22T10:00:00.000Z",
          },
        ],
      });
    });

    it("não inclui evaluationStatus/evaluations quando a API não os envia (researcher)", () => {
      const { evaluation_status, evaluations, ...rawResearcher } = rawProjectFromApi;

      const project = toProject(rawResearcher);

      expect(project).not.toHaveProperty("evaluationStatus");
      expect(project).not.toHaveProperty("evaluations");
    });
  });

  describe("toPagination", () => {
    it("converte page_size, total_items e total_pages para camelCase", () => {
      expect(
        toPagination({
          page: 2,
          page_size: 10,
          total_items: 42,
          total_pages: 5,
        }),
      ).toEqual({
        page: 2,
        pageSize: 10,
        totalItems: 42,
        totalPages: 5,
      });
    });
  });

  describe("getProjectsRequest", () => {
    it("retorna items e pagination quando a API responde 200", async () => {
      mockFetchOnce({
        ok: true,
        status: 200,
        json: async () => rawListResponse,
      });

      const result = await getProjectsRequest({ page: 1, pageSize: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(42);
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 20,
        totalItems: 1,
        totalPages: 1,
      });
    });

    it("envia o token no header Authorization", async () => {
      const fetchMock = mockFetchOnce({
        ok: true,
        status: 200,
        json: async () => rawListResponse,
      });

      await getProjectsRequest({});

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/projects"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token",
          }),
        }),
      );
    });

    it("monta a query string com page, page_size e evaluation_status", async () => {
      const fetchMock = mockFetchOnce({
        ok: true,
        status: 200,
        json: async () => rawListResponse,
      });

      await getProjectsRequest({
        page: 2,
        pageSize: 10,
        evaluationStatus: "waiting",
      });

      const url = String(fetchMock.mock.calls[0][0]);
      expect(url).toContain("page=2");
      expect(url).toContain("page_size=10");
      expect(url).toContain("evaluation_status=waiting");
    });

    it("não inclui parâmetros ausentes na query string", async () => {
      const fetchMock = mockFetchOnce({
        ok: true,
        status: 200,
        json: async () => rawListResponse,
      });

      await getProjectsRequest({});

      const url = String(fetchMock.mock.calls[0][0]);
      expect(url).not.toContain("page=");
      expect(url).not.toContain("page_size=");
      expect(url).not.toContain("evaluation_status=");
    });

    it("não envia researcher_id na URL (escopo é do backend)", async () => {
      const fetchMock = mockFetchOnce({
        ok: true,
        status: 200,
        json: async () => rawListResponse,
      });

      await getProjectsRequest({ page: 1 });

      const url = String(fetchMock.mock.calls[0][0]);
      expect(url).not.toContain("researcher_id");
    });

    it("lança ApiError 401 quando o backend responde 401", async () => {
      mockFetchOnce({ ok: false, status: 401, json: async () => ({}) });

      await expect(getProjectsRequest({})).rejects.toMatchObject({
        status: 401,
      });
    });

    it("lança ApiError 403 quando o backend responde 403", async () => {
      mockFetchOnce({ ok: false, status: 403, json: async () => ({}) });

      await expect(getProjectsRequest({})).rejects.toMatchObject({
        status: 403,
      });
    });

    it("lança ApiError 500 quando o backend responde 500", async () => {
      mockFetchOnce({ ok: false, status: 500, json: async () => ({}) });

      await expect(getProjectsRequest({})).rejects.toMatchObject({
        status: 500,
      });
    });

    it("propaga erro de rede sem resposta HTTP", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValueOnce(new TypeError("Failed to fetch")),
      );

      await expect(getProjectsRequest({})).rejects.toBeDefined();
    });
  });

  describe("getProjectRequest", () => {
    it("retorna um projeto mapeado quando o backend responde 200", async () => {
      mockFetchOnce({
        ok: true,
        status: 200,
        json: async () => rawProjectFromApi,
      });

      const project = await getProjectRequest(42);

      expect(project.id).toBe(42);
      expect(project.researcher.fullName).toBe("João Silva");
      expect(project.status).toHaveLength(1);
    });

    it("chama a URL com o id do projeto", async () => {
      const fetchMock = mockFetchOnce({
        ok: true,
        status: 200,
        json: async () => rawProjectFromApi,
      });

      await getProjectRequest(42);

      expect(String(fetchMock.mock.calls[0][0])).toContain("/projects/42");
    });

    it("envia o token no header Authorization", async () => {
      const fetchMock = mockFetchOnce({
        ok: true,
        status: 200,
        json: async () => rawProjectFromApi,
      });

      await getProjectRequest(42);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token",
          }),
        }),
      );
    });

    it("lança ApiError 404 quando o projeto não existe", async () => {
      mockFetchOnce({ ok: false, status: 404, json: async () => ({}) });

      await expect(getProjectRequest(99999)).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe("normalizeProjectApiError", () => {
    it.each([
      [401, "Sessão expirada. Faça login novamente."],
      [403, "Você não tem acesso a estes projetos."],
      [404, "Projeto não encontrado."],
      [500, "Erro no servidor. Tente novamente."],
    ])("mapeia o status %d para uma mensagem específica", (status, expected) => {
      const error = normalizeProjectApiError(status, undefined);
      expect(error.status).toBe(status);
      expect(error.message).toBe(expected);
    });

    it("usa mensagem genérica para status desconhecido", () => {
      const error = normalizeProjectApiError(418, undefined);
      expect(error.status).toBe(418);
      expect(error.message).toContain("Não foi possível");
    });

    it("aceita status como string (fallback do thunk) sem quebrar", () => {
      const error = normalizeProjectApiError("UNKNOWN_ERROR", undefined);
      expect(error.status).toBeUndefined();
      expect(error.message).toContain("Não foi possível");
    });
  });
});
