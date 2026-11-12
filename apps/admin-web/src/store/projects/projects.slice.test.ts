import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiError } from "../../types/api.types";
import type { ProjectListPagination, Project } from "../../types/project.types";
import { getProject, getProjects } from "./projects.api";
import projectsReducer, {
  clearProjectsError,
  clearProjectsFilters,
  clearProjectsState,
  clearSelectedProject,
  setProjectsFilters,
  setProjectsPage,
  setProjectsPageSize,
  setSelectedProject,
  type ProjectsState,
} from "./projects.slice";
import {
  selectProjectsListError,
  selectProjectsListHasItems,
  selectProjectsListLoading,
  selectProjectsListPagination,
  selectProjectsList,
  selectProjectsSelected,
} from "./projects.selectors";

const { getProjectsRequest, getProjectRequest, normalizeProjectApiError } =
  vi.hoisted(() => ({
    getProjectsRequest: vi.fn(),
    getProjectRequest: vi.fn(),
    normalizeProjectApiError: vi.fn(),
  }));

vi.mock("../../services/projects/projects.service", () => ({
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

const buildPagination = (overrides: Partial<ProjectListPagination> = {}): ProjectListPagination => ({
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

function buildSliceState(overrides: Partial<ProjectsState> = {}): ProjectsState {
  return {
    list: {
      items: [],
      pagination: null,
      filters: {},
      page: 1,
      pageSize: 20,
      status: "idle",
      error: null,
    },
    selected: null,
    download: { status: "idle", error: null, filename: null },
    ...overrides,
  };
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

      expect(store.getState().projects.selected).toEqual(project);
    });

    it("aceita null para limpar", () => {
      const store = makeTestStore();
      store.dispatch(setSelectedProject(buildProject()));

      store.dispatch(setSelectedProject(null));

      expect(store.getState().projects.selected).toBeNull();
    });
  });

  describe("clearSelectedProject", () => {
    it("zera apenas o selectedProject, mantendo o resto", () => {
      const store = makeTestStore();
      store.dispatch(setSelectedProject(buildProject()));

      store.dispatch(clearSelectedProject());

      const state = store.getState().projects;
      expect(state.selected).toBeNull();
      // os outros campos não foram tocados
      expect(state.list.status).toBe("idle");
      expect(state.list.error).toBeNull();
      expect(state.download).toEqual({ status: "idle", error: null, filename: null });
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
      expect(store.getState().projects.list.items).toHaveLength(1);

      // Limpa
      store.dispatch(clearProjectsState());

      const state = store.getState().projects;
      expect(state.list.items).toEqual([]);
      expect(state.selected).toBeNull();
      expect(state.list.pagination).toBeNull();
      expect(state.list.filters).toEqual({});
      expect(state.list.page).toBe(1);
      expect(state.list.pageSize).toBe(20);
      expect(state.list.status).toBe("idle");
      expect(state.list.error).toBeNull();
    });
  });

  describe("clearProjectsError", () => {
    it("limpa o error sem mexer no resto", async () => {
      getProjectsRequest.mockRejectedValueOnce(buildApiError({ status: 404 }));
      const store = makeTestStore();
      await store.dispatch(getProjects({}));

      expect(store.getState().projects.list.status).toBe("failed");
      expect(store.getState().projects.list.error).not.toBeNull();

      store.dispatch(clearProjectsError());

      expect(store.getState().projects.list.error).toBeNull();
    });

    it("volta para idle se o status era failed", async () => {
      getProjectsRequest.mockRejectedValueOnce(buildApiError());
      const store = makeTestStore();
      await store.dispatch(getProjects({}));

      store.dispatch(clearProjectsError());

      expect(store.getState().projects.list.status).toBe("idle");
    });

    it("não altera o status se não era failed", () => {
      const store = makeTestStore();
      // status está "idle" por padrão
      store.dispatch(clearProjectsError());
      expect(store.getState().projects.list.status).toBe("idle");
    });
  });

  describe("consulta da listagem", () => {
    it("armazena filtros e volta para a primeira página", () => {
      const store = makeTestStore();

      store.dispatch(setProjectsPage(3));
      store.dispatch(
        setProjectsFilters({
          search: "oncologia",
          status: "under_review",
          evaluationStatus: "to_review",
          evaluationContext: "pre_safe_room",
        }),
      );

      expect(store.getState().projects.list.filters).toEqual({
        search: "oncologia",
        status: "under_review",
        evaluationStatus: "to_review",
        evaluationContext: "pre_safe_room",
      });
      expect(store.getState().projects.list.page).toBe(1);
    });

    it("limpa filtros e altera o tamanho da página", () => {
      const store = makeTestStore();

      store.dispatch(setProjectsFilters({ search: "oncologia" }));
      store.dispatch(setProjectsPageSize(50));
      store.dispatch(clearProjectsFilters());

      expect(store.getState().projects.list.filters).toEqual({});
      expect(store.getState().projects.list.page).toBe(1);
      expect(store.getState().projects.list.pageSize).toBe(50);
    });
  });

  describe("extraReducers via getProjects", () => {
    it("pending: status = pending, error = null", () => {
      let resolveRequest: (v: unknown) => void;
      const pending = new Promise((resolve) => { resolveRequest = resolve; });
      getProjectsRequest.mockReturnValueOnce(pending);

      const store = makeTestStore();
      store.dispatch(
        getProjects({
          evaluationStatus: "to_review",
          evaluationContext: "pre_safe_room",
        }),
      );

      expect(store.getState().projects.list.status).toBe("pending");
      expect(store.getState().projects.list.error).toBeNull();
      expect(store.getState().projects.list.filters).toEqual({
        evaluationStatus: "to_review",
        evaluationContext: "pre_safe_room",
      });

      resolveRequest!({ items: [], pagination: buildPagination() });
    });

    it("fulfilled: grava projects e pagination", async () => {
      const items = [buildProject({ id: 1 }), buildProject({ id: 2 })];
      const pagination = buildPagination({ totalItems: 2 });
      getProjectsRequest.mockResolvedValueOnce({ items, pagination });

      const store = makeTestStore();
      await store.dispatch(getProjects({}));

      const state = store.getState().projects;
      expect(state.list.status).toBe("succeeded");
      expect(state.list.items).toEqual(items);
      expect(state.list.pagination).toEqual(pagination);
      expect(state.list.error).toBeNull();
    });

    it("rejected: grava error e status = failed", async () => {
      const apiError = buildApiError({ status: 403, message: "Sem acesso" });
      getProjectsRequest.mockRejectedValueOnce(apiError);

      const store = makeTestStore();
      await store.dispatch(getProjects({}));

      const state = store.getState().projects;
      expect(state.list.status).toBe("failed");
      expect(state.list.error).toEqual(apiError);
    });
  });

  describe("extraReducers via getProject", () => {
    it("fulfilled: grava selectedProject", async () => {
      const project = buildProject({ id: 99 });
      getProjectRequest.mockResolvedValueOnce(project);

      const store = makeTestStore();
      await store.dispatch(getProject(99));

      const state = store.getState().projects;
      expect(state.list.status).toBe("succeeded");
      expect(state.selected).toEqual(project);
    });

    it("rejected: grava error sem setar selectedProject", async () => {
      const apiError = buildApiError({ status: 404 });
      getProjectRequest.mockRejectedValueOnce(apiError);

      const store = makeTestStore();
      await store.dispatch(getProject(999));

      const state = store.getState().projects;
      expect(state.list.status).toBe("failed");
      expect(state.list.error).toEqual(apiError);
      expect(state.selected).toBeNull();
    });
  });

  describe("selectors", () => {
    it("selectProjectsList retorna a lista", () => {
      const items = [buildProject()];
      const state = { projects: buildSliceState({ list: { ...buildSliceState().list, items } }) };
      expect(selectProjectsList(state)).toEqual(items);
    });

    it("selectSelectedProject retorna o projeto selecionado", () => {
      const project = buildProject();
      const state = { projects: buildSliceState({ selected: project }) };
      expect(selectProjectsSelected(state)).toEqual(project);
    });

    it("selectProjectsListPagination retorna a paginação", () => {
      const pagination = buildPagination();
      const state = { projects: buildSliceState({ list: { ...buildSliceState().list, pagination } }) };
      expect(selectProjectsListPagination(state)).toEqual(pagination);
    });

    it("selectProjectsListError retorna o erro", () => {
      const error = buildApiError();
      const state = { projects: buildSliceState({ list: { ...buildSliceState().list, status: "failed", error } }) };
      expect(selectProjectsListError(state)).toEqual(error);
    });

    it("selectProjectsListLoading é true somente em pending", () => {
      expect(selectProjectsListLoading({ projects: buildSliceState({ list: { ...buildSliceState().list, status: "idle" } }) })).toBe(false);
      expect(selectProjectsListLoading({ projects: buildSliceState({ list: { ...buildSliceState().list, status: "pending" } }) })).toBe(true);
      expect(selectProjectsListLoading({ projects: buildSliceState({ list: { ...buildSliceState().list, status: "succeeded" } }) })).toBe(false);
      expect(selectProjectsListLoading({ projects: buildSliceState({ list: { ...buildSliceState().list, status: "failed" } }) })).toBe(false);
    });

    it("selectProjectsListHasItems reflete se a lista está vazia", () => {
      const empty = { projects: buildSliceState() };
      const filled = {
        projects: {
          ...empty.projects,
          list: { ...empty.projects.list, items: [buildProject()] },
        },
      };

      expect(selectProjectsListHasItems(empty)).toBe(false);
      expect(selectProjectsListHasItems(filled)).toBe(true);
    });
  });
});
