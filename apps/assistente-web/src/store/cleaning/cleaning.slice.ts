import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import type { CleaningVersion, WizardSession } from '../../types/assistant.types';
import type { ApiError, OperationState } from '../../types/api.types';
import { idleOperation } from '../../types/api.types';
import {
  createCleaning,
  generateCleaningScript,
  generateInitialCleaningScript,
  getCleaning,
  getCleaningList,
  getCleaningVersions,
  restoreCleaningVersion,
  saveCleaningVersion,
  sendCleaningChat,
  startCleaningKickoff,
  startNewCleaningVersion,
  updateCleaning,
  validateCleaningScript,
  exportCleaning,
  exportCleaningVersion,
} from './cleaning.api';

const sessionActions = [createCleaning.fulfilled, getCleaning.fulfilled, updateCleaning.fulfilled, restoreCleaningVersion.fulfilled, startNewCleaningVersion.fulfilled] as const;
const operationThunks = [createCleaning, getCleaning, updateCleaning, sendCleaningChat, startCleaningKickoff,
  generateInitialCleaningScript, generateCleaningScript, validateCleaningScript, getCleaningVersions,
  saveCleaningVersion, startNewCleaningVersion, restoreCleaningVersion, exportCleaning, exportCleaningVersion] as const;

export const CLEANING_OPERATION_KEYS = [
  'create', 'load', 'save', 'chat', 'kickoff', 'script', 'validation', 'versions', 'download',
] as const;
export type CleaningOperationKey = (typeof CLEANING_OPERATION_KEYS)[number];
export type CleaningOperations = Record<CleaningOperationKey, OperationState>;

const createCleaningOperations = (): CleaningOperations => Object.fromEntries(
  CLEANING_OPERATION_KEYS.map((key) => [key, idleOperation()]),
) as CleaningOperations;

const operationByActionType: Record<string, CleaningOperationKey> = {
  [createCleaning.pending.type]: 'create', [createCleaning.fulfilled.type]: 'create', [createCleaning.rejected.type]: 'create',
  [getCleaning.pending.type]: 'load', [getCleaning.fulfilled.type]: 'load', [getCleaning.rejected.type]: 'load',
  [updateCleaning.pending.type]: 'save', [updateCleaning.fulfilled.type]: 'save', [updateCleaning.rejected.type]: 'save',
  [sendCleaningChat.pending.type]: 'chat', [sendCleaningChat.fulfilled.type]: 'chat', [sendCleaningChat.rejected.type]: 'chat',
  [startCleaningKickoff.pending.type]: 'kickoff', [startCleaningKickoff.fulfilled.type]: 'kickoff', [startCleaningKickoff.rejected.type]: 'kickoff',
  [generateInitialCleaningScript.pending.type]: 'script', [generateInitialCleaningScript.fulfilled.type]: 'script', [generateInitialCleaningScript.rejected.type]: 'script',
  [generateCleaningScript.pending.type]: 'script', [generateCleaningScript.fulfilled.type]: 'script', [generateCleaningScript.rejected.type]: 'script',
  [validateCleaningScript.pending.type]: 'validation', [validateCleaningScript.fulfilled.type]: 'validation', [validateCleaningScript.rejected.type]: 'validation',
  [getCleaningVersions.pending.type]: 'versions', [getCleaningVersions.fulfilled.type]: 'versions', [getCleaningVersions.rejected.type]: 'versions',
  [saveCleaningVersion.pending.type]: 'versions', [saveCleaningVersion.fulfilled.type]: 'versions', [saveCleaningVersion.rejected.type]: 'versions',
  [startNewCleaningVersion.pending.type]: 'versions', [startNewCleaningVersion.fulfilled.type]: 'versions', [startNewCleaningVersion.rejected.type]: 'versions',
  [restoreCleaningVersion.pending.type]: 'versions', [restoreCleaningVersion.fulfilled.type]: 'versions', [restoreCleaningVersion.rejected.type]: 'versions',
  [exportCleaning.pending.type]: 'download', [exportCleaning.fulfilled.type]: 'download', [exportCleaning.rejected.type]: 'download',
  [exportCleaningVersion.pending.type]: 'download', [exportCleaningVersion.fulfilled.type]: 'download', [exportCleaningVersion.rejected.type]: 'download',
};

type CleaningState = {
  items: WizardSession[];
  selected: WizardSession | null;
  versions: CleaningVersion[];
  list: ReturnType<typeof idleOperation>;
  operations: CleaningOperations;
};
const initialState: CleaningState = { items: [], selected: null, versions: [], list: idleOperation(), operations: createCleaningOperations() };

const cleaningSlice = createSlice({
  name: 'cleaning',
  initialState,
  reducers: {
    setSelectedCleaning(state, action: PayloadAction<WizardSession | null>) { state.selected = action.payload; },
    clearCleaningError(state) {
      state.list.error = null;
      Object.values(state.operations).forEach((operation) => { operation.error = null; });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCleaningList.pending, (state) => { state.list = { status: 'pending', error: null, operation: 'list' }; });
    builder.addCase(getCleaningList.fulfilled, (state, action) => { state.items = action.payload; state.list = { status: 'succeeded', error: null, operation: 'list' }; });
    builder.addCase(getCleaningList.rejected, (state, action) => { state.list = { status: 'failed', error: action.payload ?? { message: action.error.message || 'Falha ao carregar limpezas' }, operation: 'list' }; });
    builder.addCase(getCleaningVersions.fulfilled, (state, action) => { state.versions = action.payload; });
    builder.addMatcher(isAnyOf(...sessionActions), (state, action) => { state.selected = action.payload; });
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
      state.operations[key] = { status: 'failed', error: error ?? { message: action.error.message || 'Falha na operação' }, operation: action.type };
    });
  },
});
export const { setSelectedCleaning, clearCleaningError } = cleaningSlice.actions;
export default cleaningSlice.reducer;
