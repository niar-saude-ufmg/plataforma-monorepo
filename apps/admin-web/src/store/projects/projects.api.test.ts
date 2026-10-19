import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import type {ApiError } from '../../types/api.types';
import type { Project, ProjectListResponse } from '../../types/project.types';
import { downloadProjectDocument, getProject, getProjects } from './projects.api';
import projectsReducer from "./projects.slice";

const {
  getProjectsRequest,
  getProjectRequest,
  downloadProjectDocumentRequest,
  normalizeProjectApiError,
  normalizeProjectDocumentApiError,
} =
  vi.hoisted(() => ({
    getProjectsRequest: vi.fn(),
    getProjectRequest: vi.fn(),
    downloadProjectDocumentRequest: vi.fn(),
    normalizeProjectApiError: vi.fn(),
    normalizeProjectDocumentApiError: vi.fn(),
  }));

vi.mock("../../services/projects/projects.service", () => ({
  getProjectsRequest,
  getProjectRequest,
  downloadProjectDocumentRequest,
  normalizeProjectApiError,
  normalizeProjectDocumentApiError,
}));

const buildProject = (overrides: Partial<Project> = {}): Project => ({
  id: 42,
  title: "Pareamento oncológico",
  updatedAt: "2026-09-25T12:00:00.000Z",
  researcher: { id: 10, fullName: "João Silva", email: "joao@niar.local" },
  status: [],
  documents: [],
  ...overrides,
});

const buildListResponse = (
  overrides: Partial<ProjectListResponse> = {},
): ProjectListResponse => ({
  items: [buildProject()],
  pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
  ...overrides,
});

const buildApiError = (overrides: Partial<ApiError> = {}): ApiError => ({
  message: "Não foi possível carregar os projetos.",
  status: 500,
  ...overrides,
});

function makeTestStore() {
  return configureStore({
    reducer: { projects: projectsReducer },
  });
}

describe("projects thunks", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    getProjectsRequest.mockReset();
    getProjectRequest.mockReset();
    downloadProjectDocumentRequest.mockReset();
    normalizeProjectApiError.mockReset();
    normalizeProjectDocumentApiError.mockReset();

    normalizeProjectApiError.mockReturnValue(
      buildApiError({ message: "Erro inesperado", status: undefined }),
    );
    normalizeProjectDocumentApiError.mockReturnValue(
      buildApiError({ message: "Erro inesperado", status: undefined }),
    );
  });

  describe("getProjects", () => {
    it("chama o service com os parâmetros recebidos", async () => {
      getProjectsRequest.mockResolvedValueOnce(buildListResponse());
      const store = makeTestStore();

      await store.dispatch(
        getProjects({ page: 2, pageSize: 10, evaluationStatus: "waiting" }),
      );

      expect(getProjectsRequest).toHaveBeenCalledTimes(1);
      expect(getProjectsRequest).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        evaluationStatus: "waiting",
      });
    });

    it("preenche projects e pagination no state quando dá certo", async () => {
      const listResponse = buildListResponse();
      getProjectsRequest.mockResolvedValueOnce(listResponse);
      const store = makeTestStore();

      await store.dispatch(getProjects({ page: 1 }));

      const state = store.getState().projects;
      expect(state.list.status).toBe("succeeded");
      expect(state.list.error).toBeNull();
      expect(state.list.items).toEqual(listResponse.items);
      expect(state.list.pagination).toEqual(listResponse.pagination);
    });

    it("marca status como pending antes de resolver", async () => {
      let resolveRequest: (value: ProjectListResponse) => void;
      const pending = new Promise<ProjectListResponse>((resolve) => {
        resolveRequest = resolve;
      });
      getProjectsRequest.mockReturnValueOnce(pending);

      const store = makeTestStore();
      const dispatchPromise = store.dispatch(getProjects({}));

      // Ainda não resolveu — o estado deve estar pending
      expect(store.getState().projects.list.status).toBe("pending");
      expect(store.getState().projects.list.error).toBeNull();

      // Resolve para o teste terminar limpo
      resolveRequest!(buildListResponse());
      await dispatchPromise;
    });

    it("guarda o erro e marca failed quando o service lança ApiError", async () => {
      const apiError = buildApiError({
        status: 403,
        message: "Você não tem acesso a estes projetos.",
      });
      getProjectsRequest.mockRejectedValueOnce(apiError);
      const store = makeTestStore();

      await store.dispatch(getProjects({}));

      const state = store.getState().projects;
      expect(state.list.status).toBe("failed");
      expect(state.list.error).toEqual(apiError);
      expect(state.list.items).toEqual([]);
    });

    it("usa o fallback quando o service lança erro desconhecido (não ApiError)", async () => {
      getProjectsRequest.mockRejectedValueOnce(new Error("boom"));
      normalizeProjectApiError.mockReturnValueOnce(
        buildApiError({ message: "Não foi possível carregar.", status: undefined }),
      );
      const store = makeTestStore();

      await store.dispatch(getProjects({}));

      const state = store.getState().projects;
      expect(state.list.status).toBe("failed");
      expect(normalizeProjectApiError).toHaveBeenCalledWith(
        "UNKNOWN_ERROR",
        undefined,
      );
      expect(state.list.error?.message).toContain("Não foi possível");
    });
  });

  describe("getProject", () => {
    it("chama o service com o id do projeto", async () => {
      getProjectRequest.mockResolvedValueOnce(buildProject());
      const store = makeTestStore();

      await store.dispatch(getProject(42));

      expect(getProjectRequest).toHaveBeenCalledTimes(1);
      expect(getProjectRequest).toHaveBeenCalledWith(42);
    });

    it("preenche selectedProject quando dá certo", async () => {
      const project = buildProject({ id: 99 });
      getProjectRequest.mockResolvedValueOnce(project);
      const store = makeTestStore();

      await store.dispatch(getProject(99));

      const state = store.getState().projects;
      expect(state.list.status).toBe("succeeded");
      expect(state.list.error).toBeNull();
      expect(state.selected).toEqual(project);
    });

    it("guarda o erro e não seta selectedProject quando falha", async () => {
      const apiError = buildApiError({ status: 404, message: "Projeto não encontrado." });
      getProjectRequest.mockRejectedValueOnce(apiError);
      const store = makeTestStore();

      await store.dispatch(getProject(999));

      const state = store.getState().projects;
      expect(state.list.status).toBe("failed");
      expect(state.list.error).toEqual(apiError);
      expect(state.selected).toBeNull();
    });
  });

  describe("consistência do slice único", () => {
    it("mantém a consulta de lista e a consulta de detalhe no mesmo estado de leitura", async () => {
      getProjectsRequest.mockResolvedValueOnce(buildListResponse());
      const store = makeTestStore();

      await store.dispatch(getProjects({}));
      expect(store.getState().projects.list.status).toBe("succeeded");

      getProjectRequest.mockResolvedValueOnce(buildProject());
      await store.dispatch(getProject(42));
      expect(store.getState().projects.list.status).toBe("succeeded");

      // Erro do getProject sobrescreve o status anterior
      getProjectRequest.mockRejectedValueOnce(buildApiError({ status: 404 }));
      await store.dispatch(getProject(999));
      expect(store.getState().projects.list.status).toBe("failed");
      expect(store.getState().projects.list.error).not.toBeNull();
    });
  });

  describe("downloadProjectDocument", () => {
    it("chama o service com projectId e documentId e retorna o arquivo", async () => {
      const file = { blob: new Blob(["docx-fake"]), filename: "projeto.docx" };
      downloadProjectDocumentRequest.mockResolvedValueOnce(file);
      vi.stubGlobal("URL", {
        createObjectURL: vi.fn().mockReturnValue("blob:projeto"),
        revokeObjectURL: vi.fn(),
      });
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
      const store = makeTestStore();

      await store.dispatch(downloadProjectDocument({ projectId: 42, documentId: 101 }));

      expect(downloadProjectDocumentRequest).toHaveBeenCalledWith(42, 101);
      expect(store.getState().projects.download).toEqual({
        status: "succeeded",
        error: null,
        filename: "projeto.docx",
      });
    });

    it("guarda o erro do download no estado", async () => {
      const apiError = buildApiError({ status: 403, message: "Sem acesso" });
      downloadProjectDocumentRequest.mockRejectedValueOnce(apiError);
      const store = makeTestStore();

      await store.dispatch(downloadProjectDocument({ projectId: 42, documentId: 101 }));

      expect(store.getState().projects.download).toEqual({
        status: "failed",
        error: apiError,
        filename: null,
      });
    });
  });
});
