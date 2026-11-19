import { ACCESS_TOKEN_STORAGE_KEY } from '@niar/auth';
import type { ApiError } from '../types/api.types';
import type { DownloadedFile } from '../types/assistant.types';

const ASSISTANT_API_URL = (import.meta.env.VITE_API_URL || '/api/assistente').replace(/\/+$/, '');
const ADMIN_API_URL = (import.meta.env.VITE_ADMIN_API_URL || '/api/admin').replace(/\/+$/, '');

type ApiTarget = 'assistant' | 'admin';

function apiUrl(target: ApiTarget) {
  return target === 'admin' ? ADMIN_API_URL : ASSISTANT_API_URL;
}

function authHeaders(body?: BodyInit | null): HeadersInit {
  const headers: Record<string, string> = {};
  if (!(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function responseError(response: Response, fallback = 'Falha na requisição'): Promise<ApiError> {
  const text = await response.text();
  let detail: unknown = response.statusText;
  try {
    detail = JSON.parse(text).detail;
  } catch {
    if (text.trim()) detail = text.trim();
  }

  let message = fallback;
  if (typeof detail === 'string') {
    message = detail;
  } else if (Array.isArray(detail)) {
    message = detail.map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const loc = Array.isArray((item as { loc?: unknown }).loc)
          ? (item as { loc: unknown[] }).loc.filter((part) => part !== 'body').join('.')
          : '';
        const description = String((item as { msg?: string }).msg || 'Valor inválido');
        return loc ? `${loc}: ${description}` : description;
      }
      return String(item);
    }).filter(Boolean).join('; ') || fallback;
  } else if (detail && typeof detail === 'object') {
    const value = detail as { message?: string; debug?: unknown; issues?: string[] };
    const debug = value.debug ? `\n\nDepuração:\n${JSON.stringify(value.debug, null, 2)}` : '';
    const issues = value.issues?.length ? `\n\n${value.issues.join('\n')}` : '';
    message = `${value.message || fallback}${issues}${debug}`;
  }
  return { status: response.status, message };
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  target: ApiTarget = 'assistant',
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiUrl(target)}${path}`, {
      ...options,
      headers: { ...authHeaders(options.body), ...options.headers },
    });
  } catch {
    throw { message: 'Não foi possível conectar ao servidor.' } satisfies ApiError;
  }
  if (!response.ok) throw await responseError(response);
  if (response.status === 204) return undefined as T;
  if ((response.headers.get('content-type') || '').includes('application/json')) return response.json();
  return response as unknown as T;
}

export async function requestFile(
  path: string,
  options: RequestInit,
  fallbackFilename: string,
  networkErrorMessage = 'Não foi possível concluir a operação. Verifique sua conexão e tente novamente.',
): Promise<DownloadedFile> {
  let response: Response;
  try {
    response = await fetch(`${ASSISTANT_API_URL}${path}`, {
      ...options,
      headers: { ...authHeaders(options.body), ...options.headers },
    });
  } catch {
    throw { message: networkErrorMessage } satisfies ApiError;
  }
  if (!response.ok) throw await responseError(response);
  const disposition = response.headers.get('content-disposition');
  const filename = disposition?.match(/filename\*?=(?:UTF-8''|\")?([^";]+)/i)?.[1];
  return {
    blob: await response.blob(),
    filename: filename ? decodeURIComponent(filename.replace(/^"|"$/g, '')) : fallbackFilename,
  };
}

export function downloadFile({ blob, filename }: DownloadedFile) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function toApiError(error: unknown, fallback: string): ApiError {
  if (error && typeof error === 'object' && 'message' in error) {
    return {
      message: String((error as { message: unknown }).message),
      ...('status' in error && typeof (error as { status?: unknown }).status === 'number'
        ? { status: (error as { status: number }).status }
        : {}),
    };
  }
  return { message: fallback };
}

export function errorMessage(error: unknown, fallback: string) {
  return toApiError(error, fallback).message;
}
