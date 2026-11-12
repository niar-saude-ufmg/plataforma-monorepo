import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ProjectListFilters,
  ProjectListItem,
  ProjectListPagination,
} from "../../types/project.types";
import type { ApiError } from "../../types/api.types";
import type { AsyncStatus, FileState, ResourceState } from "../../types/resource.types";
import { downloadProjectDocument, getProjects, getProject } from "./projects.api";

export type ProjectsStatus = AsyncStatus;

export const DEFAULT_PROJECTS_PAGE_SIZE = 20;

const createDefaultProjectsFilters = (): ProjectListFilters => ({});

export type ProjectsState = ResourceState<ProjectListItem, ProjectListFilters, ProjectListPagination, ApiError> & {
  selected: ProjectListItem | null;
  download: FileState<ApiError>;
};

const initialState: ProjectsState = {
  list: {
    items: [],
    pagination: null,
    filters: createDefaultProjectsFilters(),
    page: 1,
    pageSize: DEFAULT_PROJECTS_PAGE_SIZE,
    status: "idle",
    error: null,
  },
  selected: null,
  download: { status: "idle", error: null, filename: null },
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setSelectedProject(state, action: PayloadAction<ProjectListItem | null>) {
      state.selected = action.payload;
    },
    clearSelectedProject(state) {
      state.selected = null;
    },
    clearProjectsState(state) {
      state.list = {
        items: [],
        pagination: null,
        filters: createDefaultProjectsFilters(),
        page: 1,
        pageSize: DEFAULT_PROJECTS_PAGE_SIZE,
        status: "idle",
        error: null,
      };
      state.selected = null;
      state.download = { status: "idle", error: null, filename: null };
    },
    setProjectsFilters(state, action: PayloadAction<ProjectListFilters>) {
      state.list.filters = action.payload;
      state.list.page = 1;
    },
    clearProjectsFilters(state) {
      state.list.filters = createDefaultProjectsFilters();
      state.list.page = 1;
    },
    setProjectsPage(state, action: PayloadAction<number>) {
      state.list.page = Math.max(1, action.payload);
    },
    setProjectsPageSize(state, action: PayloadAction<number>) {
      state.list.pageSize = Math.max(1, action.payload);
      state.list.page = 1;
    },
    clearProjectsError(state) {
      state.list.error = null;
      if (state.list.status === "failed") {
        state.list.status = "idle";
      }
      state.download.error = null;
      if (state.download.status === "failed") {
        state.download.status = "idle";
      }
    },
  },
  extraReducers: (builder) => {
    // ---------- getProjects ----------
    builder.addCase(getProjects.pending, (state, action) => {
      state.list.status = "pending";
      state.list.error = null;
      state.list.filters = {
        ...(action.meta.arg.search ? { search: action.meta.arg.search } : {}),
        ...(action.meta.arg.status ? { status: action.meta.arg.status } : {}),
        ...(action.meta.arg.evaluationStatus ? { evaluationStatus: action.meta.arg.evaluationStatus } : {}),
        ...(action.meta.arg.evaluationContext ? { evaluationContext: action.meta.arg.evaluationContext } : {}),
      };
      state.list.page = action.meta.arg.page ?? 1;
      state.list.pageSize = action.meta.arg.pageSize ?? DEFAULT_PROJECTS_PAGE_SIZE;
    });
    builder.addCase(getProjects.fulfilled, (state, action) => {
      state.list.status = "succeeded";
      state.list.error = null;
      state.list.items = action.payload.items;
      state.list.pagination = action.payload.pagination;
    });
    builder.addCase(getProjects.rejected, (state, action) => {
      state.list.status = "failed";
      state.list.error = action.payload ?? {
        message: "Não foi possível carregar os projetos. Tente novamente.",
      };
    });

    // ---------- getProject ----------
    builder.addCase(getProject.pending, (state) => {
      state.list.status = "pending";
      state.list.error = null;
    });
    builder.addCase(getProject.fulfilled, (state, action) => {
      state.list.status = "succeeded";
      state.list.error = null;
      state.selected = action.payload;
    });
    builder.addCase(getProject.rejected, (state, action) => {
      state.list.status = "failed";
      state.list.error = action.payload ?? {
        message: "Não foi possível carregar o projeto. Tente novamente.",
      };
    });

    builder.addCase(downloadProjectDocument.pending, (state) => {
      state.download = { status: "pending", error: null, filename: null };
    });
    builder.addCase(downloadProjectDocument.fulfilled, (state, action) => {
      state.download = { status: "succeeded", error: null, filename: action.payload.filename };
    });
    builder.addCase(downloadProjectDocument.rejected, (state, action) => {
      state.download = {
        status: "failed",
        error: action.payload ?? {
          message: "Não foi possível baixar o documento do projeto. Tente novamente.",
        },
        filename: null,
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
