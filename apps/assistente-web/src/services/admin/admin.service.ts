import type { AdminUser, AuditEntry, Setting } from '../../types/assistant.types';
import { request } from '../http';

export const listSettingsRequest = () => request<Setting[]>('/admin/settings');
export const updateSettingRequest = (key: string, value: string) =>
  request<Setting>(`/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });
export const listAuditRequest = () => request<AuditEntry[]>('/admin/audit');
export const listUsersRequest = () => request<AdminUser[]>('/admin/users');
export const createUserRequest = (data: {
  email: string;
  full_name: string;
  password: string;
  role: string;
}) => request<AdminUser>('/admin/users', { method: 'POST', body: JSON.stringify(data) });
