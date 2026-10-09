import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import type {ApiError } from '../../types/api.types';
import type { Project, ProjectListResponse } from '../../types/project.types';
import { getProject, getProjects } from './projects.api';
import projectsReducer from "./projects.slice";

const { getProjectsRequest, getProjectRequest, normalizeProjectApiError } =
  vi.hoisted(() => ({
    getProjectsRequest: vi.fn(),
    getProjectRequest: vi.fn(),
    normalizeProjectApiError: vi.fn(),
  }));

vi.mock("../../services/projects/admin-api", () => ({
  getProjectsRequest,
  getProjectRequest,
  normalizeProjectApiError,
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
  beforeEach(() => {
    getProjectsRequest.mockReset();
    getProjectRequest.mockReset();
    normalizeProjectApiError.mockReset();

    normalizeProjectApiError.mockReturnValue(
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
      expect(state.status).toBe("succeeded");
      expect(state.error).toBeNull();
      expect(state.projects).toEqual(listResponse.items);
      expect(state.pagination).toEqual(listResponse.pagination);
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
      expect(store.getState().projects.status).toBe("pending");
      expect(store.getState().projects.error).toBeNull();

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
      expect(state.status).toBe("failed");
      expect(state.error).toEqual(apiError);
      expect(state.projects).toEqual([]);
    });

    it("usa o fallback quando o service lança erro desconhecido (não ApiError)", async () => {
      getProjectsRequest.mockRejectedValueOnce(new Error("boom"));
      normalizeProjectApiError.mockReturnValueOnce(
        buildApiError({ message: "Não foi possível carregar.", status: undefined }),
      );
      const store = makeTestStore();

      await store.dispatch(getProjects({}));

      const state = store.getState().projects;
      expect(state.status).toBe("failed");
      expect(normalizeProjectApiError).toHaveBeenCalledWith(
        "UNKNOWN_ERROR",
        undefined,
      );
      expect(state.error?.message).toContain("Não foi possível");
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
      expect(state.status).toBe("succeeded");
      expect(state.error).toBeNull();
      expect(state.selectedProject).toEqual(project);
    });

    it("guarda o erro e não seta selectedProject quando falha", async () => {
      const apiError = buildApiError({ status: 404, message: "Projeto não encontrado." });
      getProjectRequest.mockRejectedValueOnce(apiError);
      const store = makeTestStore();

      await store.dispatch(getProject(999));

      const state = store.getState().projects;
      expect(state.status).toBe("failed");
      expect(state.error).toEqual(apiError);
      expect(state.selectedProject).toBeNull();
    });
  });

  describe("consistência do slice único", () => {
    it("os dois thunks escrevem no mesmo status e error", async () => {
      getProjectsRequest.mockResolvedValueOnce(buildListResponse());
      const store = makeTestStore();

      await store.dispatch(getProjects({}));
      expect(store.getState().projects.status).toBe("succeeded");

      getProjectRequest.mockResolvedValueOnce(buildProject());
      await store.dispatch(getProject(42));
      expect(store.getState().projects.status).toBe("succeeded");

      // Erro do getProject sobrescreve o status anterior
      getProjectRequest.mockRejectedValueOnce(buildApiError({ status: 404 }));
      await store.dispatch(getProject(999));
      expect(store.getState().projects.status).toBe("failed");
      expect(store.getState().projects.error).not.toBeNull();
    });
  });
});
