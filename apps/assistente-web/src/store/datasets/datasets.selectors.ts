import type { RootState } from '..';
export const selectDatasets = (state: RootState) => state.datasets.catalog;
export const selectAdminDatasets = (state: RootState) => state.datasets.adminItems;
export const selectDatasetSchema = (state: RootState) => state.datasets.schema;
export const selectDatasetTables = (state: RootState) => state.datasets.tables;
export const selectDatasetsLoad = (state: RootState) => state.datasets.load;
export const selectDatasetsMutation = (state: RootState) => state.datasets.mutation;
