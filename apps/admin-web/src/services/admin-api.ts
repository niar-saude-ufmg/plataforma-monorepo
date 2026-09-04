import type { ApiError, CreateUserInput, CreateUserPayload, User } from '../types/user';

type ApiValidationIssue = {
  message: string;
  path?: string[];
};

type CreateUserApiResponse = {
  id: number;
  full_name: string;
  email: string;
  role: 'researcher' | 'admin';
  is_active: boolean;
  created_at: string;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export function getAdminApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_ADMIN_API_URL?.trim();

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api/admin`;
  }

  return '/api/admin';
}

function toCreateUserPayload(input: CreateUserInput): CreateUserPayload {
  return {
    full_name: input.fullName.trim(),
    email: input.email.trim(),
    password: input.password,
    role: input.role,
  };
}

function toUser(response: CreateUserApiResponse): User {
  return {
    id: response.id,
    fullName: response.full_name,
    email: response.email,
    role: response.role,
    createdAt: response.created_at,
  };
}

function translateValidationMessage(field: string | undefined, message: string) {
  if (field === 'fullName' && message === 'Full name is required') {
    return 'Informe o nome completo do pesquisador.';
  }

  if (field === 'email' && message === 'Invalid email address') {
    return 'Informe um e-mail válido, como nome@instituicao.org.';
  }

  if (field === 'password' && message === 'Password must be at least 8 characters long') {
    return 'A senha precisa ter pelo menos 8 caracteres.';
  }

  return message;
}

function toUiField(path?: string[]) {
  const field = path?.[0];

  if (field === 'full_name') {
    return 'fullName' as const;
  }

  if (field === 'email' || field === 'password') {
    return field;
  }

  return undefined;
}

function normalizeValidationError(status: number, issues: ApiValidationIssue[]): ApiError {
  const fieldErrors: ApiError['fieldErrors'] = {};

  for (const issue of issues) {
    const field = toUiField(issue.path);

    if (field) {
      fieldErrors[field] = translateValidationMessage(field, issue.message);
    }
  }

  return {
    status,
    message: 'Revise os campos informados.',
    fieldErrors,
  };
}

async function readJsonBody(response: Response) {
  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    return null;
  }

  return response.json();
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const response = await fetch(`${getAdminApiBaseUrl()}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(toCreateUserPayload(input)),
  });

  const body = await readJsonBody(response);

  if (!response.ok) {
    if (response.status === 400 && body && Array.isArray(body.errors)) {
      throw normalizeValidationError(response.status, body.errors as ApiValidationIssue[]);
    }

    if (response.status === 409 && body && typeof body.error === 'string') {
      throw {
        status: response.status,
        message: 'Este e-mail já está cadastrado.',
        fieldErrors: {
          email: 'Este e-mail já está cadastrado.',
        },
      } satisfies ApiError;
    }

    throw {
      status: response.status,
      message: body && typeof body.error === 'string'
        ? 'Não foi possível cadastrar o pesquisador.'
        : 'Não foi possível cadastrar o pesquisador. Tente novamente.',
    } satisfies ApiError;
  }

  return toUser(body as CreateUserApiResponse);
}
