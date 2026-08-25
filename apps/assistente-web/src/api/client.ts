// Empty string = same origin (production behind Caddy). Use ?? so "" is kept.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface WizardSession {
  id: number;
  wizard_type: string;
  current_step: string;
  title: string;
  dataset_id: number | null;
  linked_project_id: number | null;
  section_data: Record<string, string>;
  script_content: string;
  validation_result: Record<string, unknown>;
  quality_checklist: { items?: Array<{ id?: string; item: string; passed: boolean; note: string; step?: string }> };
  llm_model_used: string;
  created_at: string;
  updated_at: string;
  messages: Array<{ id: number; role: string; content: string; created_at: string; channel?: string; section_key?: string | null }>;
  linked_cleaning_step?: string | null;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    let detail: unknown = res.statusText;
    try {
      detail = JSON.parse(text).detail;
    } catch {
      if (text.trim()) detail = text.trim();
    }
    let message = 'Falha na requisição';
    if (typeof detail === 'string') {
      message = detail;
    } else if (Array.isArray(detail)) {
      message = detail
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            const loc = Array.isArray((item as { loc?: unknown }).loc)
              ? (item as { loc: unknown[] }).loc.filter((p) => p !== 'body').join('.')
              : '';
            const msg = String((item as { msg?: string }).msg || 'Valor inválido');
            return loc ? `${loc}: ${msg}` : msg;
          }
          return String(item);
        })
        .filter(Boolean)
        .join('; ') || message;
    } else if (detail && typeof detail === 'object') {
      const msg = (detail as { message?: string }).message || 'Falha na requisição';
      const debug = (detail as { debug?: unknown }).debug
        ? `\n\nDepuração:\n${JSON.stringify((detail as { debug?: unknown }).debug, null, 2)}`
        : '';
      message = `${msg}${debug}`;
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res as unknown as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string }>('/api/auth/login/json', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<User>('/api/auth/me'),
  listProjects: () => request<WizardSession[]>('/api/projects'),
  createProject: (title: string) =>
    request<WizardSession>('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ wizard_type: 'project_doc', title }),
    }),
  getProject: (id: number) => request<WizardSession>(`/api/projects/${id}`),
  updateProject: (id: number, data: Record<string, unknown>) =>
    request<WizardSession>(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  saveProjectDraft: (id: number, data: Record<string, unknown>) =>
    request<WizardSession>(`/api/projects/${id}/save-draft`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  importFullText: (id: number, fullText: string) =>
    request<WizardSession>(`/api/projects/${id}/import-text`, {
      method: 'POST',
      body: JSON.stringify({ full_text: fullText }),
    }),
  importDocx: (id: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<WizardSession>(`/api/projects/${id}/import-docx`, {
      method: 'POST',
      body: form,
    });
  },
  projectChat: (id: number, content: string) =>
    request<{ id: number; role: string; content: string; created_at: string; channel?: string }>(
      `/api/projects/${id}/chat`,
      { method: 'POST', body: JSON.stringify({ content }) }
    ),
  advisoryChat: (id: number, content: string) =>
    request<{ id: number; role: string; content: string; created_at: string; channel?: string }>(
      `/api/projects/${id}/advisory-chat`,
      { method: 'POST', body: JSON.stringify({ content }) }
    ),
  extractSection: (id: number, sectionKey: string) =>
    request<Record<string, unknown>>(`/api/projects/${id}/extract/${sectionKey}`, { method: 'POST' }),
  qualityCheck: (id: number) =>
    request<{ items: Array<{ id?: string; item: string; passed: boolean; note: string; step?: string }> }>(
      `/api/projects/${id}/quality-check`,
      { method: 'POST' }
    ),
  exportProject: async (id: number) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/api/projects/${id}/export`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Falha na exportação');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project.docx';
    a.click();
    URL.revokeObjectURL(url);
  },
  submitForReview: async (projectId: number) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/api/projects/${projectId}/submit-for-review`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const text = await res.text();
      let detail: unknown = res.statusText;
      try {
        detail = JSON.parse(text).detail;
      } catch {
        if (text.trim()) detail = text.trim();
      }
      let message = 'Falha na submissão';
      if (typeof detail === 'string') {
        message = detail;
      } else if (detail && typeof detail === 'object') {
        const msg = (detail as { message?: string }).message || message;
        const issues = (detail as { issues?: string[] }).issues;
        const issuesNote = issues?.length ? `\n\n${issues.join('\n')}` : '';
        message = `${msg}${issuesNote}`;
      }
      throw new Error(message);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissao_projeto_${projectId}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  },
  getProjectCleaning: (projectId: number) =>
    request<WizardSession>(`/api/projects/${projectId}/cleaning`),
  createProjectCleaning: (projectId: number) =>
    request<WizardSession>(`/api/projects/${projectId}/cleaning`, { method: 'POST' }),
  listCleaning: () => request<WizardSession[]>('/api/cleaning'),
  createCleaning: (title: string) =>
    request<WizardSession>('/api/cleaning', {
      method: 'POST',
      body: JSON.stringify({ wizard_type: 'data_clean', title }),
    }),
  getCleaning: (id: number) => request<WizardSession>(`/api/cleaning/${id}`),
  updateCleaning: (id: number, data: Record<string, unknown>) =>
    request<WizardSession>(`/api/cleaning/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  listDatasets: () => request<Array<{ id: number; name: string; description: string }>>('/api/cleaning/datasets'),
  getSchema: (datasetId: number) => request<Record<string, unknown>>(`/api/cleaning/datasets/${datasetId}/schema`),
  cleaningChat: (id: number, content: string) =>
    request<{ id: number; role: string; content: string; created_at: string }>(
      `/api/cleaning/${id}/chat`,
      { method: 'POST', body: JSON.stringify({ content }) }
    ),
  cleaningKickoff: (id: number) =>
    request<{ id: number; role: string; content: string; created_at: string }>(
      `/api/cleaning/${id}/kickoff`,
      { method: 'POST' }
    ),
  generateInitialScript: (id: number) =>
    request<{
      script_content: string;
      validation_result: Record<string, unknown>;
      already_exists?: boolean;
    }>(`/api/cleaning/${id}/initial-script`, { method: 'POST' }),
  generateScript: (id: number) =>
    request<{ script_content: string; validation_result: Record<string, unknown> }>(
      `/api/cleaning/${id}/generate-script`,
      { method: 'POST' }
    ),
  validateScript: (id: number) =>
    request<Record<string, unknown>>(`/api/cleaning/${id}/validate`, { method: 'POST' }),
  listCleaningVersions: (id: number) =>
    request<Array<{
      id: number;
      session_id: number;
      version_number: number;
      label: string;
      script_content: string;
      validation_result: Record<string, unknown>;
      messages_snapshot: Array<{ role: string; content: string }>;
      notes: string;
      created_at: string;
    }>>(`/api/cleaning/${id}/versions`),
  saveCleaningVersion: (id: number, data: { label?: string; notes?: string }) =>
    request(`/api/cleaning/${id}/versions`, { method: 'POST', body: JSON.stringify(data) }),
  startNewCleaningVersion: (id: number, data: { save_current?: boolean; current_label?: string; notes?: string }) =>
    request<WizardSession>(`/api/cleaning/${id}/versions/new`, { method: 'POST', body: JSON.stringify(data) }),
  restoreCleaningVersion: (id: number, versionId: number) =>
    request<WizardSession>(`/api/cleaning/${id}/versions/${versionId}/restore`, { method: 'POST' }),
  exportCleaningVersion: async (id: number, versionId: number) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/api/cleaning/${id}/versions/${versionId}/export`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Falha na exportação');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_clean_v${versionId}.py`;
    a.click();
    URL.revokeObjectURL(url);
  },
  exportCleaning: async (id: number) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/api/cleaning/${id}/export`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Falha na exportação');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data_clean.py';
    a.click();
    URL.revokeObjectURL(url);
  },
  adminDatasets: () => request<Array<{ id: number; name: string; description: string; enabled: boolean }>>('/api/admin/datasets'),
  createDataset: (data: { name: string; description: string; enabled: boolean }) =>
    request('/api/admin/datasets', { method: 'POST', body: JSON.stringify(data) }),
  updateDataset: (id: number, data: Record<string, unknown>) =>
    request(`/api/admin/datasets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDataset: (id: number) => request(`/api/admin/datasets/${id}`, { method: 'DELETE' }),
  listTables: (datasetId: number) => request<Array<Record<string, unknown>>>(`/api/admin/datasets/${datasetId}/tables`),
  createTable: (datasetId: number, data: { name: string; description: string }) =>
    request(`/api/admin/datasets/${datasetId}/tables`, { method: 'POST', body: JSON.stringify(data) }),
  createColumn: (tableId: number, data: Record<string, unknown>) =>
    request(`/api/admin/tables/${tableId}/columns`, { method: 'POST', body: JSON.stringify(data) }),
  deleteColumn: (columnId: number) => request(`/api/admin/columns/${columnId}`, { method: 'DELETE' }),
  listSettings: () => request<Array<{ key: string; value: string }>>('/api/admin/settings'),
  updateSetting: (key: string, value: string) =>
    request(`/api/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),
  listAudit: () => request<Array<Record<string, unknown>>>('/api/admin/audit'),
  listUsers: () =>
    request<Array<{ id: number; email: string; full_name: string; role: string; is_active: boolean }>>(
      '/api/admin/users',
    ),
  createUser: (data: { email: string; full_name: string; password: string; role: string }) =>
    request<{ id: number; email: string; full_name: string; role: string; is_active: boolean }>(
      '/api/admin/users',
      { method: 'POST', body: JSON.stringify(data) },
    ),
};
