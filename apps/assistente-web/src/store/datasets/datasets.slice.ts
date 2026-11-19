import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { AdminDataset, DatasetSummary } from '../../types/assistant.types';
import { idleOperation } from '../../types/api.types';
import {
  createDataset,
  createDatasetTable,
  createTableColumn,
  deleteDataset,
  deleteTableColumn,
  getAdminDatasets,
  getDatasetSchema,
  getDatasets,
  getDatasetTables,
  updateDataset,
} from './datasets.api';

type DatasetsState = {
  catalog: DatasetSummary[];
  adminItems: AdminDataset[];
  schema: Record<string, unknown> | null;
  tables: Array<Record<string, unknown>>;
  load: ReturnType<typeof idleOperation>;
  mutation: ReturnType<typeof idleOperation>;
};
const initialState: DatasetsState = { catalog: [], adminItems: [], schema: null, tables: [], load: idleOperation(), mutation: idleOperation() };
const mutations = [createDataset, updateDataset, deleteDataset, createDatasetTable, createTableColumn, deleteTableColumn] as const;

const datasetsSlice = createSlice({
  name: 'datasets', initialState, reducers: {
    clearDatasetSchema(state) { state.schema = null; },
  },
  extraReducers: (builder) => {
    builder.addCase(getDatasets.fulfilled, (state, action) => { state.catalog = action.payload; });
    builder.addCase(getAdminDatasets.fulfilled, (state, action) => { state.adminItems = action.payload; });
    builder.addCase(getDatasetSchema.fulfilled, (state, action) => { state.schema = action.payload; });
    builder.addCase(getDatasetTables.fulfilled, (state, action) => { state.tables = action.payload; });
    builder.addMatcher(isAnyOf(getDatasets.pending, getAdminDatasets.pending, getDatasetSchema.pending, getDatasetTables.pending), (state, action) => {
      state.load = { status: 'pending', error: null, operation: action.type };
    });
    builder.addMatcher(isAnyOf(getDatasets.rejected, getAdminDatasets.rejected, getDatasetSchema.rejected, getDatasetTables.rejected), (state, action) => {
      state.load = { status: 'failed', error: action.payload ?? { message: action.error.message || 'Falha ao carregar dados' }, operation: action.type };
    });
    builder.addMatcher(isAnyOf(getDatasets.fulfilled, getAdminDatasets.fulfilled, getDatasetSchema.fulfilled, getDatasetTables.fulfilled), (state, action) => {
      state.load = { status: 'succeeded', error: null, operation: action.type };
    });
    builder.addMatcher(isAnyOf(...mutations.map((thunk) => thunk.pending)), (state, action) => { state.mutation = { status: 'pending', error: null, operation: action.type }; });
    builder.addMatcher(isAnyOf(...mutations.map((thunk) => thunk.fulfilled)), (state, action) => { state.mutation = { status: 'succeeded', error: null, operation: action.type }; });
    builder.addMatcher(isAnyOf(...mutations.map((thunk) => thunk.rejected)), (state, action) => { state.mutation = { status: 'failed', error: action.payload ?? { message: action.error.message || 'Falha na operação' }, operation: action.type }; });
  },
});
export const { clearDatasetSchema } = datasetsSlice.actions;
export default datasetsSlice.reducer;
