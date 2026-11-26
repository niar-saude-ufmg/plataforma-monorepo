import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import type { WizardSession } from '../../types/assistant.types';
import type { ApiError, OperationState } from '../../types/api.types';
import { idleOperation } from '../../types/api.types';
import {
  createProject,
  createProjectCleaning,
  exportProject,
  getProject,
  getProjectCleaning,
  getProjects,
  importProjectDocx,
  importProjectText,
  runProjectQualityCheck,
  saveProjectDraft,
  sendAdvisoryChat,
  sendProjectChat,
  submitProjectForReview,
  updateProject,
  extractProjectSection,
} from './projects.api';

const sessionActions = [
  createProject.fulfilled,
  getProject.fulfilled,
  updateProject.fulfilled,
  saveProjectDraft.fulfilled,
  importProjectText.fulfilled,
  importProjectDocx.fulfilled,
] as const;

const operationThunks = [
  createProject, getProject, updateProject, saveProjectDraft, importProjectText, importProjectDocx,
  sendProjectChat, sendAdvisoryChat, extractProjectSection, runProjectQualityCheck,
  getProjectCleaning, createProjectCleaning, exportProject, submitProjectForReview,
] as const;

export const PROJECT_OPERATION_KEYS = [
  'create', 'load', 'save', 'import', 'chat', 'extract', 'quality', 'cleaning', 'download',
] as const;
export type ProjectOperationKey = (typeof PROJECT_OPERATION_KEYS)[number];
export type ProjectOperations = Record<ProjectOperationKey, OperationState>;

const createProjectOperations = (): ProjectOperations => Object.fromEntries(
  PROJECT_OPERATION_KEYS.map((key) => [key, idleOperation()]),
) as ProjectOperations;

const operationByActionType: Record<string, ProjectOperationKey> = {
  [createProject.pending.type]: 'create', [createProject.fulfilled.type]: 'create', [createProject.rejected.type]: 'create',
  [getProject.pending.type]: 'load', [getProject.fulfilled.type]: 'load', [getProject.rejected.type]: 'load',
  [updateProject.pending.type]: 'save', [updateProject.fulfilled.type]: 'save', [updateProject.rejected.type]: 'save',
  [saveProjectDraft.pending.type]: 'save', [saveProjectDraft.fulfilled.type]: 'save', [saveProjectDraft.rejected.type]: 'save',
  [importProjectText.pending.type]: 'import', [importProjectText.fulfilled.type]: 'import', [importProjectText.rejected.type]: 'import',
  [importProjectDocx.pending.type]: 'import', [importProjectDocx.fulfilled.type]: 'import', [importProjectDocx.rejected.type]: 'import',
  [sendProjectChat.pending.type]: 'chat', [sendProjectChat.fulfilled.type]: 'chat', [sendProjectChat.rejected.type]: 'chat',
  [sendAdvisoryChat.pending.type]: 'chat', [sendAdvisoryChat.fulfilled.type]: 'chat', [sendAdvisoryChat.rejected.type]: 'chat',
  [extractProjectSection.pending.type]: 'extract', [extractProjectSection.fulfilled.type]: 'extract', [extractProjectSection.rejected.type]: 'extract',
  [runProjectQualityCheck.pending.type]: 'quality', [runProjectQualityCheck.fulfilled.type]: 'quality', [runProjectQualityCheck.rejected.type]: 'quality',
  [getProjectCleaning.pending.type]: 'cleaning', [getProjectCleaning.fulfilled.type]: 'cleaning', [getProjectCleaning.rejected.type]: 'cleaning',
  [createProjectCleaning.pending.type]: 'cleaning', [createProjectCleaning.fulfilled.type]: 'cleaning', [createProjectCleaning.rejected.type]: 'cleaning',
  [exportProject.pending.type]: 'download', [exportProject.fulfilled.type]: 'download', [exportProject.rejected.type]: 'download',
  [submitProjectForReview.pending.type]: 'download', [submitProjectForReview.fulfilled.type]: 'download', [submitProjectForReview.rejected.type]: 'download',
};

export type ProjectsState = {
  items: WizardSession[];
  selected: WizardSession | null;
  linkedCleaning: WizardSession | null;
  list: ReturnType<typeof idleOperation>;
  operations: ProjectOperations;
};

const initialState: ProjectsState = {
  items: [], selected: null, linkedCleaning: null, list: idleOperation(), operations: createProjectOperations(),
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setSelectedProject(state, action: PayloadAction<WizardSession | null>) { state.selected = action.payload; },
    setLinkedCleaning(state, action: PayloadAction<WizardSession | null>) { state.linkedCleaning = action.payload; },
    clearProjectsError(state) {
      state.list.error = null;
      Object.values(state.operations).forEach((operation) => { operation.error = null; });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getProjects.pending, (state) => { state.list = { status: 'pending', error: null, operation: 'list' }; });
    builder.addCase(getProjects.fulfilled, (state, action) => {
      state.items = action.payload;
      state.list = { status: 'succeeded', error: null, operation: 'list' };
    });
    builder.addCase(getProjects.rejected, (state, action) => {
      state.list = { status: 'failed', error: action.payload ?? { message: action.error.message || 'Falha ao carregar projetos' }, operation: 'list' };
    });
    builder.addMatcher(isAnyOf(...sessionActions), (state, action) => { state.selected = action.payload; });
    builder.addMatcher(isAnyOf(getProjectCleaning.fulfilled, createProjectCleaning.fulfilled), (state, action) => {
      state.linkedCleaning = action.payload;
    });
    builder.addMatcher(isAnyOf(...operationThunks.map((thunk) => thunk.pending)), (state, action) => {
      const key = operationByActionType[action.type];
      state.operations[key] = { status: 'pending', error: null, operation: action.type };
    });
    builder.addMatcher(isAnyOf(...operationThunks.map((thunk) => thunk.fulfilled)), (state, action) => {
      const key = operationByActionType[action.type];
      state.operations[key] = { status: 'succeeded', error: null, operation: action.type };
    });
    builder.addMatcher(isAnyOf(...operationThunks.map((thunk) => thunk.rejected)), (state, action) => {
      const key = operationByActionType[action.type];
      const error = action.payload as ApiError | undefined;
      state.operations[key] = {
        status: 'failed',
        error: error ?? { message: action.error.message || 'Falha na operação' },
        operation: action.type,
      };
    });
  },
});

export const { setSelectedProject, setLinkedCleaning, clearProjectsError } = projectsSlice.actions;
export default projectsSlice.reducer;
