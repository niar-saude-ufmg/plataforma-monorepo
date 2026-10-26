import { ACCESS_TOKEN_STORAGE_KEY } from '@niar/auth';
import { getAdminApiBaseUrl } from '../auth/auth.service';
import type {
  CreateSpecialtyInput,
  SpecialtyListParams,
  SpecialtyListResponse,
  Specialty,
  SpecialtyApiError,
  SpecialtyField,
  UpdateSpecialtyInput,
} from '../../types/specialty.types';

type SpecialtyApiResponse = {
  id: number;
  code: string;
  name: string;
  description: string;
  guidance_context: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type SpecialtyListApiResponse = {
  items: SpecialtyApiResponse[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

type ApiValidationIssue = {
  message: string;
  path?: Array<string | number>;
};

type ApiErrorBody = {
  error?: string;
  errors?: ApiValidationIssue[];
};

const specialtyFieldByApiField: Record<string, SpecialtyField> = {
  code: 'code',
  name: 'name',
  description: 'description',
  guidance_context: 'guidanceContext',
  is_active: 'isActive',
};

const toSpecialty = (response: SpecialtyApiResponse): Specialty => ({
  id: response.id,
  code: response.code,
  name: response.name,
  description: response.description,
  guidanceContext: response.guidance_context,
  isActive: response.is_active,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
});

const readJsonBody = async (response: Response): Promise<ApiErrorBody | SpecialtyApiResponse | SpecialtyListApiResponse | null> => {
  if (!response.headers.get('content-type')?.includes('application/json')) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

const validationError = (status: number, issues: ApiValidationIssue[]): SpecialtyApiError => {
  const fieldErrors: SpecialtyApiError['fieldErrors'] = {};

  for (const issue of issues) {
    const field = specialtyFieldByApiField[String(issue.path?.[0])];
    if (field) {
      fieldErrors[field] = issue.message;
    }
  }

  return { status, message: 'Revise os campos informados.', fieldErrors };
};

const httpError = (status: number, body: ApiErrorBody | null): SpecialtyApiError => {
  if ((status === 400 || status === 422) && Array.isArray(body?.errors)) {
    return validationError(status, body.errors);
  }

  if (status === 401) return { status, message: 'Sua sessão expirou. Entre novamente.' };
  if (status === 403) return { status, message: 'Você não tem permissão para gerenciar especialidades.' };
  if (status === 404) return { status, message: 'Especialidade não encontrada.' };

  if (status === 409) {
    const message = body?.error ?? 'Já existe uma especialidade com estes dados.';
    const normalizedMessage = message.toLocaleLowerCase('pt-BR');
    const field = normalizedMessage.includes('código') ? 'code' : normalizedMessage.includes('nome') ? 'name' : undefined;

    return {
      status,
      message,
      ...(field ? { fieldErrors: { [field]: message } } : {}),
    };
  }

  return {
    status,
    message: status >= 500
      ? 'Não foi possível concluir a operação. Tente novamente.'
      : body?.error ?? 'Não foi possível concluir a operação.',
  };
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const token = typeof window === 'undefined' ? null : window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  const headers = new Headers(init.headers);

  if (init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${getAdminApiBaseUrl()}${path}`, { ...init, headers });
  } catch {
    throw { message: 'Não foi possível conectar ao servidor.' } satisfies SpecialtyApiError;
  }

  const body = await readJsonBody(response);
  if (!response.ok) {
    throw httpError(response.status, body as ApiErrorBody | null);
  }

  return body as T;
};

export const listSpecialties = async (params: SpecialtyListParams = {}): Promise<SpecialtyListResponse> => {
  const searchParams = new URLSearchParams();

  if (params.query) searchParams.set('query', params.query);
  if (params.isActive !== undefined) searchParams.set('is_active', String(params.isActive));
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.pageSize !== undefined) searchParams.set('page_size', String(params.pageSize));

  const queryString = searchParams.toString();
  const response = await request<SpecialtyListApiResponse>(`/specialties${queryString ? `?${queryString}` : ''}`);

  return {
    items: response.items.map(toSpecialty),
    pagination: {
      page: response.pagination.page,
      pageSize: response.pagination.page_size,
      totalItems: response.pagination.total_items,
      totalPages: response.pagination.total_pages,
    },
  };
};

export const createSpecialty = async (input: CreateSpecialtyInput): Promise<Specialty> => {
  const response = await request<SpecialtyApiResponse>('/specialties', {
    method: 'POST',
    body: JSON.stringify({
      code: input.code.trim(),
      name: input.name.trim(),
      description: input.description,
      guidance_context: input.guidanceContext,
    }),
  });

  return toSpecialty(response);
};

export const updateSpecialty = async (id: number, input: UpdateSpecialtyInput): Promise<Specialty> => {
  const response = await request<SpecialtyApiResponse>(`/specialties/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: input.name?.trim(),
      description: input.description,
      guidance_context: input.guidanceContext,
    }),
  });

  return toSpecialty(response);
};

export const updateSpecialtyStatus = async (id: number, isActive: boolean): Promise<Specialty> => {
  const response = await request<SpecialtyApiResponse>(`/specialties/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });

  return toSpecialty(response);
};
