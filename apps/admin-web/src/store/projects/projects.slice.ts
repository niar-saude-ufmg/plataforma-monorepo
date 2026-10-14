import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Project,
  Pagination,
  ProjectListParams,
} from "../../types/project.types";
import type { ApiError } from "../../types/api.types";
import { getProjects, getProject } from "./projects.api";

export type ProjectsStatus = "idle" | "pending" | "succeeded" | "failed";

export type ProjectsFilters = Pick<
  ProjectListParams,
  "search" | "status" | "evaluationStatus"
>;

export const DEFAULT_PROJECTS_PAGE_SIZE = 20;

const createDefaultProjectsFilters = (): ProjectsFilters => ({});

export type ProjectsState = {
  projects: Project[];
  selectedProject: Project | null;
  pagination: Pagination | null;
  filters: ProjectsFilters;
  page: number;
  pageSize: number;
  status: ProjectsStatus;
  error: ApiError | null;
};

const initialState: ProjectsState = {
  projects: [],
  selectedProject: null,
  pagination: null,
  filters: createDefaultProjectsFilters(),
  page: 1,
  pageSize: DEFAULT_PROJECTS_PAGE_SIZE,
  status: "idle",
  error: null,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setSelectedProject(state, action: PayloadAction<Project | null>) {
      state.selectedProject = action.payload;
    },
    clearSelectedProject(state) {
      state.selectedProject = null;
    },
    clearProjectsState(state) {
      state.projects = [];
      state.selectedProject = null;
      state.pagination = null;
      state.filters = createDefaultProjectsFilters();
      state.page = 1;
      state.pageSize = DEFAULT_PROJECTS_PAGE_SIZE;
      state.status = "idle";
      state.error = null;
    },
    setProjectsFilters(state, action: PayloadAction<ProjectsFilters>) {
      state.filters = action.payload;
      state.page = 1;
    },
    clearProjectsFilters(state) {
      state.filters = createDefaultProjectsFilters();
      state.page = 1;
    },
    setProjectsPage(state, action: PayloadAction<number>) {
      state.page = Math.max(1, action.payload);
    },
    setProjectsPageSize(state, action: PayloadAction<number>) {
      state.pageSize = Math.max(1, action.payload);
      state.page = 1;
    },
    clearProjectsError(state) {
      state.error = null;
      if (state.status === "failed") {
        state.status = "idle";
      }
    },
  },
  extraReducers: (builder) => {
    // ---------- getProjects ----------
    builder.addCase(getProjects.pending, (state, action) => {
      state.status = "pending";
      state.error = null;
      state.filters = {
        ...(action.meta.arg.search ? { search: action.meta.arg.search } : {}),
        ...(action.meta.arg.status ? { status: action.meta.arg.status } : {}),
        ...(action.meta.arg.evaluationStatus ? { evaluationStatus: action.meta.arg.evaluationStatus } : {}),
      };
      state.page = action.meta.arg.page ?? 1;
      state.pageSize = action.meta.arg.pageSize ?? DEFAULT_PROJECTS_PAGE_SIZE;
    });
    builder.addCase(getProjects.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.error = null;
      state.projects = action.payload.items;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(getProjects.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload ?? {
        message: "Não foi possível carregar os projetos. Tente novamente.",
      };
    });

    // ---------- getProject ----------
    builder.addCase(getProject.pending, (state) => {
      state.status = "pending";
      state.error = null;
    });
    builder.addCase(getProject.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.error = null;
      state.selectedProject = action.payload;
    });
    builder.addCase(getProject.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload ?? {
        message: "Não foi possível carregar o projeto. Tente novamente.",
      };
    });
  },
});

export const {
  setSelectedProject,
  clearSelectedProject,
  clearProjectsState,
  clearProjectsError,
  setProjectsFilters,
  clearProjectsFilters,
  setProjectsPage,
  setProjectsPageSize,
} = projectsSlice.actions;

export default projectsSlice.reducer;
