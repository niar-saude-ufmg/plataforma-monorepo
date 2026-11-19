import type { AdminDataset, DatasetSummary } from '../../types/assistant.types';
import { request } from '../http';

export const listDatasetsRequest = () => request<DatasetSummary[]>('/cleaning/datasets');
export const getSchemaRequest = (datasetId: number) =>
  request<Record<string, unknown>>(`/cleaning/datasets/${datasetId}/schema`);

export const listAdminDatasetsRequest = () => request<AdminDataset[]>('/admin/datasets');
export const createDatasetRequest = (data: Omit<AdminDataset, 'id'>) =>
  request<AdminDataset>('/admin/datasets', { method: 'POST', body: JSON.stringify(data) });
export const updateDatasetRequest = (id: number, data: Record<string, unknown>) =>
  request<AdminDataset>(`/admin/datasets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDatasetRequest = (id: number) =>
  request<void>(`/admin/datasets/${id}`, { method: 'DELETE' });
export const listTablesRequest = (datasetId: number) =>
  request<Array<Record<string, unknown>>>(`/admin/datasets/${datasetId}/tables`);
export const createTableRequest = (datasetId: number, data: { name: string; description: string }) =>
  request(`/admin/datasets/${datasetId}/tables`, { method: 'POST', body: JSON.stringify(data) });
export const createColumnRequest = (tableId: number, data: Record<string, unknown>) =>
  request(`/admin/tables/${tableId}/columns`, { method: 'POST', body: JSON.stringify(data) });
export const deleteColumnRequest = (columnId: number) =>
  request<void>(`/admin/columns/${columnId}`, { method: 'DELETE' });
