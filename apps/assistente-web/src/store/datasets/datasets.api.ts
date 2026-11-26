import {
  createColumnRequest,
  createDatasetRequest,
  createTableRequest,
  deleteColumnRequest,
  deleteDatasetRequest,
  getSchemaRequest,
  listAdminDatasetsRequest,
  listDatasetsRequest,
  listTablesRequest,
  updateDatasetRequest,
} from '../../services/datasets/datasets.service';
import { createApiThunk } from '../utils/create-api-thunk';

export const getDatasets = createApiThunk('datasets/catalog', listDatasetsRequest, 'Falha ao carregar catálogo');
export const getDatasetSchema = createApiThunk('datasets/schema', getSchemaRequest, 'Falha ao carregar esquema');
export const getAdminDatasets = createApiThunk('datasets/adminList', listAdminDatasetsRequest, 'Falha ao carregar conjuntos');
export const createDataset = createApiThunk('datasets/create', createDatasetRequest, 'Falha ao criar conjunto');
export const updateDataset = createApiThunk(
  'datasets/update',
  ({ id, data }: { id: number; data: Record<string, unknown> }) => updateDatasetRequest(id, data),
  'Falha ao atualizar conjunto',
);
export const deleteDataset = createApiThunk('datasets/delete', deleteDatasetRequest, 'Falha ao excluir conjunto');
export const getDatasetTables = createApiThunk('datasets/tables', listTablesRequest, 'Falha ao carregar tabelas');
export const createDatasetTable = createApiThunk(
  'datasets/createTable',
  ({ datasetId, data }: { datasetId: number; data: { name: string; description: string } }) =>
    createTableRequest(datasetId, data),
  'Falha ao criar tabela',
);
export const createTableColumn = createApiThunk(
  'datasets/createColumn',
  ({ tableId, data }: { tableId: number; data: Record<string, unknown> }) => createColumnRequest(tableId, data),
  'Falha ao criar coluna',
);
export const deleteTableColumn = createApiThunk('datasets/deleteColumn', deleteColumnRequest, 'Falha ao excluir coluna');
