import { ACCESS_TOKEN_STORAGE_KEY } from '@niar/auth';
import type { UserAccountStatus } from '@niar/contracts';
import type {
  AuthApiError,
  AuthFormFieldErrors,
  AuthUser,
  ChangePasswordInput,
  UpdateProfileInput,
  UserRole,
} from '../../types/user.types';

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

type ApiValidationIssue = {
  message: string;
  path?: string[];
};

type SessionProfileApiResponse = {
  phone: string | null;
  institution: string | null;
  organizational_unit: string | null;
  contact_address: string | null;
};

type SessionUserApiResponse = {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  account_status: UserAccountStatus;
  profile?: SessionProfileApiResponse | null;
  researcher_profile?: { research_area: string | null; position: string | null } | null;
  coep?: {
    caae: string;
    opinion_number: string;
    approval_date: string;
    document_filename: string;
  } | null;
  committee_profile?: {
    specialty: {
      id: number;
      code: string;
      name: string;
    };
  } | null;
};

/** Corpo aceito pelo PATCH /auth/me. password_confirmation não existe no contrato. */
export type UpdateAuthUserRequestInput =
  | { operation: 'updateProfile'; data: UpdateProfileInput }
  | { operation: 'changePassword'; data: ChangePasswordInput };

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function toAuthUser(response: SessionUserApiResponse): AuthUser {
  return {
    id: response.id,
    name: response.full_name,
    email: response.email,
    role: response.role,
    accountStatus: response.account_status,
    ...(response.profile
      ? {
          profile: {
            phone: response.profile.phone,
            institution: response.profile.institution,
            organizationalUnit: response.profile.organizational_unit,
            contactAddress: response.profile.contact_address,
          },
        }
      : {}),
    ...(response.researcher_profile
      ? {
          researcherProfile: {
            researchArea: response.researcher_profile.research_area,
            position: response.researcher_profile.position,
          },
        }
      : {}),
    ...(response.coep
      ? {
          coep: {
            caae: response.coep.caae,
            opinionNumber: response.coep.opinion_number,
            approvalDate: response.coep.approval_date,
            documentFilename: response.coep.document_filename,
          },
        }
      : {}),
    ...(response.committee_profile
      ? {
          committeeProfile: {
            specialty: {
              id: response.committee_profile.specialty.id,
              code: response.committee_profile.specialty.code,
              name: response.committee_profile.specialty.name,
            },
          },
        }
      : {}),
  };
}

/** camelCase da UI para snake_case da API, sem campos vazios. */
export function toUpdateAuthUserBody(input: UpdateAuthUserRequestInput) {
  if (input.operation === 'changePassword') {
    return {
      current_password: input.data.currentPassword,
      password: input.data.password,
    };
  }

  const body: Record<string, string> = {};
  const fullName = input.data.fullName?.trim();
  const email = input.data.email?.trim();
  const phone = input.data.phone?.trim();

  if (fullName) body.full_name = fullName;
  if (email) body.email = email;
  if (phone) body.phone = phone;

  return body;
}

export async function updateAuthUserRequest(
  input: UpdateAuthUserRequestInput,
): Promise<AuthUser> {
  let response: Response;

  try {
    response = await fetch(`${getAdminApiBaseUrl()}/auth/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(toUpdateAuthUserBody(input)),
    });
  } catch {
    throw normalizeAuthApiError('FETCH_ERROR', undefined, input.operation);
  }

  const body = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw normalizeAuthApiError(response.status, body, input.operation);
  }

  return toAuthUser(body as SessionUserApiResponse);
}

const authFieldByApiPath: Record<string, keyof AuthFormFieldErrors> = {
  full_name: 'fullName',
  email: 'email',
  phone: 'phone',
  current_password: 'currentPassword',
  password: 'password',
};

const authValidationMessages: Record<string, string> = {
  'Full name is required': 'Informe o nome completo.',
  'Invalid email address': 'Informe um e-mail válido, como nome@instituicao.org.',
  'Phone is required': 'Informe o telefone.',
  'Current password is required': 'Informe a senha atual.',
  'Current password is required to set a new password': 'Informe a senha atual.',
  'Password must be at least 8 characters long': 'A nova senha precisa ter pelo menos 8 caracteres.',
};

export function normalizeAuthApiError(
  status: number | string,
  body: unknown,
  operation: UpdateAuthUserRequestInput['operation'] = 'updateProfile',
): AuthApiError {
  const numericStatus = typeof status === 'number' ? status : undefined;
  const fallback = operation === 'changePassword'
    ? 'Não foi possível trocar a senha. Tente novamente.'
    : 'Não foi possível salvar o perfil. Tente novamente.';

  if (numericStatus === 400 && typeof body === 'object' && body !== null && 'errors' in body) {
    const issues = (body as { errors?: unknown }).errors;

    if (Array.isArray(issues)) {
      const fieldErrors: AuthFormFieldErrors = {};

      for (const issue of issues as ApiValidationIssue[]) {
        const field = authFieldByApiPath[issue.path?.[0] ?? ''];
        if (field) {
          fieldErrors[field] = authValidationMessages[issue.message] ?? issue.message;
        }
      }

      return { status: numericStatus, message: 'Revise os campos informados.', fieldErrors };
    }
  }

  // "Senha atual incorreta" também chega como 400, mas sem lista de erros.
  if (numericStatus === 400 && operation === 'changePassword') {
    return {
      status: 400,
      message: 'Senha atual incorreta.',
      fieldErrors: { currentPassword: 'Senha atual incorreta.' },
    };
  }

  if (numericStatus === 401) {
    return { status: 401, message: 'Sessão expirada. Faça login novamente.' };
  }

  if (numericStatus === 409) {
    return {
      status: 409,
      message: 'Este e-mail já está em uso por outro usuário.',
      fieldErrors: { email: 'Este e-mail já está em uso por outro usuário.' },
    };
  }

  if (numericStatus === 500) {
    return { status: 500, message: 'Erro no servidor. Tente novamente.' };
  }

  return { status: numericStatus, message: fallback };
}
