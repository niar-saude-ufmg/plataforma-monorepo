import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiError } from "../../types/api.types";
import type { Pagination, Project } from "../../types/project.types";
import { getProject, getProjects } from "./projects.api";
import projectsReducer, {
  clearProjectsError,
  clearProjectsState,
  clearSelectedProject,
  setSelectedProject,
} from "./projects.slice";
import {
  selectError,
  selectHasProjects,
  selectIsLoading,
  selectPagination,
  selectProjects,
  selectSelectedProject,
} from "./projects.selectors";

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

const buildPagination = (overrides: Partial<Pagination> = {}): Pagination => ({
  page: 1,
  pageSize: 20,
  totalItems: 1,
  totalPages: 1,
  ...overrides,
});

const buildApiError = (overrides: Partial<ApiError> = {}): ApiError => ({
  message: "Erro qualquer",
  status: 500,
  ...overrides,
});

function makeTestStore() {
  return configureStore({ reducer: { projects: projectsReducer } });
}

describe("projects slice", () => {
  beforeEach(() => {
    getProjectsRequest.mockReset();
    getProjectRequest.mockReset();
    normalizeProjectApiError.mockReset();
    normalizeProjectApiError.mockReturnValue(buildApiError());
  });

  describe("setSelectedProject", () => {
    it("armazena o projeto selecionado", () => {
      const store = makeTestStore();
      const project = buildProject({ id: 99 });

      store.dispatch(setSelectedProject(project));

      expect(store.getState().projects.selectedProject).toEqual(project);
    });

    it("aceita null para limpar", () => {
      const store = makeTestStore();
      store.dispatch(setSelectedProject(buildProject()));

      store.dispatch(setSelectedProject(null));

      expect(store.getState().projects.selectedProject).toBeNull();
    });
  });

  describe("clearSelectedProject", () => {
    it("zera apenas o selectedProject, mantendo o resto", () => {
      const store = makeTestStore();
      store.dispatch(setSelectedProject(buildProject()));

      store.dispatch(clearSelectedProject());

      const state = store.getState().projects;
      expect(state.selectedProject).toBeNull();
      // os outros campos não foram tocados
      expect(state.status).toBe("idle");
      expect(state.error).toBeNull();
    });
  });

  describe("clearProjectsState", () => {
    it("zera tudo e volta para idle", async () => {
      // Popula o estado via thunk
      getProjectsRequest.mockResolvedValueOnce({
        items: [buildProject()],
        pagination: buildPagination(),
      });
      const store = makeTestStore();
      await store.dispatch(getProjects({}));

      // Confirma que populou
      expect(store.getState().projects.projects).toHaveLength(1);

      // Limpa
      store.dispatch(clearProjectsState());

      const state = store.getState().projects;
      expect(state.projects).toEqual([]);
      expect(state.selectedProject).toBeNull();
      expect(state.pagination).toBeNull();
      expect(state.status).toBe("idle");
      expect(state.error).toBeNull();
    });
  });

  describe("clearProjectsError", () => {
    it("limpa o error sem mexer no resto", async () => {
      getProjectsRequest.mockRejectedValueOnce(buildApiError({ status: 404 }));
      const store = makeTestStore();
      await store.dispatch(getProjects({}));

      expect(store.getState().projects.status).toBe("failed");
      expect(store.getState().projects.error).not.toBeNull();

      store.dispatch(clearProjectsError());

      expect(store.getState().projects.error).toBeNull();
    });

    it("volta para idle se o status era failed", async () => {
      getProjectsRequest.mockRejectedValueOnce(buildApiError());
      const store = makeTestStore();
      await store.dispatch(getProjects({}));

      store.dispatch(clearProjectsError());

      expect(store.getState().projects.status).toBe("idle");
    });

    it("não altera o status se não era failed", () => {
      const store = makeTestStore();
      // status está "idle" por padrão
      store.dispatch(clearProjectsError());
      expect(store.getState().projects.status).toBe("idle");
    });
  });

  describe("extraReducers via getProjects", () => {
    it("pending: status = pending, error = null", () => {
      let resolveRequest: (v: unknown) => void;
      const pending = new Promise((resolve) => { resolveRequest = resolve; });
      getProjectsRequest.mockReturnValueOnce(pending);

      const store = makeTestStore();
      store.dispatch(getProjects({}));

      expect(store.getState().projects.status).toBe("pending");
      expect(store.getState().projects.error).toBeNull();

      resolveRequest!({ items: [], pagination: buildPagination() });
    });

    it("fulfilled: grava projects e pagination", async () => {
      const items = [buildProject({ id: 1 }), buildProject({ id: 2 })];
      const pagination = buildPagination({ totalItems: 2 });
      getProjectsRequest.mockResolvedValueOnce({ items, pagination });

      const store = makeTestStore();
      await store.dispatch(getProjects({}));

      const state = store.getState().projects;
      expect(state.status).toBe("succeeded");
      expect(state.projects).toEqual(items);
      expect(state.pagination).toEqual(pagination);
      expect(state.error).toBeNull();
    });

    it("rejected: grava error e status = failed", async () => {
      const apiError = buildApiError({ status: 403, message: "Sem acesso" });
      getProjectsRequest.mockRejectedValueOnce(apiError);

      const store = makeTestStore();
      await store.dispatch(getProjects({}));

      const state = store.getState().projects;
      expect(state.status).toBe("failed");
      expect(state.error).toEqual(apiError);
    });
  });

  describe("extraReducers via getProject", () => {
    it("fulfilled: grava selectedProject", async () => {
      const project = buildProject({ id: 99 });
      getProjectRequest.mockResolvedValueOnce(project);

      const store = makeTestStore();
      await store.dispatch(getProject(99));

      const state = store.getState().projects;
      expect(state.status).toBe("succeeded");
      expect(state.selectedProject).toEqual(project);
    });

    it("rejected: grava error sem setar selectedProject", async () => {
      const apiError = buildApiError({ status: 404 });
      getProjectRequest.mockRejectedValueOnce(apiError);

      const store = makeTestStore();
      await store.dispatch(getProject(999));

      const state = store.getState().projects;
      expect(state.status).toBe("failed");
      expect(state.error).toEqual(apiError);
      expect(state.selectedProject).toBeNull();
    });
  });

  describe("selectors", () => {
    it("selectProjects retorna a lista", () => {
      const items = [buildProject()];
      const state = {
        projects: {
          projects: items,
          selectedProject: null,
          pagination: null,
          status: "idle" as const,
          error: null,
        },
      };
      expect(selectProjects(state)).toEqual(items);
    });

    it("selectSelectedProject retorna o projeto selecionado", () => {
      const project = buildProject();
      const state = {
        projects: {
          projects: [],
          selectedProject: project,
          pagination: null,
          status: "idle" as const,
          error: null,
        },
      };
      expect(selectSelectedProject(state)).toEqual(project);
    });

    it("selectPagination retorna a paginação", () => {
      const pagination = buildPagination();
      const state = {
        projects: {
          projects: [],
          selectedProject: null,
          pagination,
          status: "idle" as const,
          error: null,
        },
      };
      expect(selectPagination(state)).toEqual(pagination);
    });

    it("selectError retorna o erro", () => {
      const error = buildApiError();
      const state = {
        projects: {
          projects: [],
          selectedProject: null,
          pagination: null,
          status: "failed" as const,
          error,
        },
      };
      expect(selectError(state)).toEqual(error);
    });

    it("selectIsLoading é true somente em pending", () => {
      const baseState = {
        projects: {
          projects: [],
          selectedProject: null,
          pagination: null,
          error: null,
        },
      };

      expect(selectIsLoading({ projects: { ...baseState.projects, status: "idle" } })).toBe(false);
      expect(selectIsLoading({ projects: { ...baseState.projects, status: "pending" } })).toBe(true);
      expect(selectIsLoading({ projects: { ...baseState.projects, status: "succeeded" } })).toBe(false);
      expect(selectIsLoading({ projects: { ...baseState.projects, status: "failed" } })).toBe(false);
    });

    it("selectHasProjects reflete se a lista está vazia", () => {
      const empty = {
        projects: {
          projects: [],
          selectedProject: null,
          pagination: null,
          status: "idle" as const,
          error: null,
        },
      };
      const filled = {
        projects: {
          ...empty.projects,
          projects: [buildProject()],
        },
      };

      expect(selectHasProjects(empty)).toBe(false);
      expect(selectHasProjects(filled)).toBe(true);
    });
  });
});
