import { ACCESS_TOKEN_STORAGE_KEY } from '@niar/auth';
import type { ApiError } from '../../types/api.types';
import type {
  UserApiError,
  CreateUserInput,
  User,
  UserListItem,
  UserListParams,
  UserListResponse,
  UserRole,
} from '../../types/user.types';
import { getAdminApiBaseUrl } from '../auth/auth.service';
import {
  getFilenameFromContentDisposition,
  type DownloadedFile,
} from '../../utils/download-file';

type ApiValidationIssue = {
  message: string;
  path?: string[];
};

type CreateUserApiResponse = {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
};

type UserListApiResponse = {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  account_status: UserListItem['accountStatus'];
  created_at: string;
  profile: {
    phone: string | null;
    institution: string | null;
    organizational_unit: string | null;
    contact_address: string | null;
  } | null;
  researcher_profile: {
    research_area: string | null;
    position: string | null;
  } | null;
  committee_profile: {
    specialty: {
      id: number;
      code: string;
      name: string;
    };
  } | null;
  coep: {
    caae: string;
    opinion_number: string;
    approval_date: string;
    document_filename: string;
  } | null;
  latest_auth_evaluation: {
    id: number;
    user_id: number;
    status: UserListItem['accountStatus'];
    justification: string | null;
    evaluated_by_user_id: number | null;
    evaluated_at: string | null;
    created_at: string;
    user_coep_data_id: number | null;
  } | null;
};

type UserListApiPage = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function toUser(response: CreateUserApiResponse): User {
  return {
    id: response.id,
    fullName: response.full_name,
    email: response.email,
    role: response.role,
    createdAt: response.created_at,
  };
}

export function toUserListItem(response: UserListApiResponse): UserListItem {
  return {
    id: response.id,
    fullName: response.full_name,
    email: response.email,
    role: response.role,
    accountStatus: response.account_status,
    createdAt: response.created_at,
    profile: response.profile
      ? {
          phone: response.profile.phone,
          institution: response.profile.institution,
          organizationalUnit: response.profile.organizational_unit,
          contactAddress: response.profile.contact_address,
        }
      : null,
    researcherProfile: response.researcher_profile
      ? {
          researchArea: response.researcher_profile.research_area,
          position: response.researcher_profile.position,
        }
      : null,
    committeeProfile: response.committee_profile
      ? {
          specialty: response.committee_profile.specialty,
        }
      : null,
    coep: response.coep
      ? {
          caae: response.coep.caae,
          opinionNumber: response.coep.opinion_number,
          approvalDate: response.coep.approval_date,
          documentFilename: response.coep.document_filename,
        }
      : null,
    latestAuthEvaluation: response.latest_auth_evaluation
      ? {
          id: response.latest_auth_evaluation.id,
          userId: response.latest_auth_evaluation.user_id,
          status: response.latest_auth_evaluation.status,
          justification: response.latest_auth_evaluation.justification,
          evaluatedByUserId: response.latest_auth_evaluation.evaluated_by_user_id,
          evaluatedAt: response.latest_auth_evaluation.evaluated_at,
          createdAt: response.latest_auth_evaluation.created_at,
          userCoepDataId: response.latest_auth_evaluation.user_coep_data_id,
        }
      : null,
  };
}

export function toUserListPagination(response: UserListApiPage) {
  return {
    page: response.page,
    pageSize: response.page_size,
    totalItems: response.total_items,
    totalPages: response.total_pages,
  };
}

export async function getUsersRequest(
  params: UserListParams = {},
): Promise<UserListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.role) query.set('role', params.role);
  if (params.accountStatus) query.set('account_status', params.accountStatus);
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.pageSize !== undefined) query.set('page_size', String(params.pageSize));

  const queryString = query.toString();
  const url = `${getAdminApiBaseUrl()}/users${queryString ? `?${queryString}` : ''}`;

  let response: Response;
  try {
    response = await fetch(url, { headers: authHeaders() });
  } catch {
    throw normalizeUserListApiError('FETCH_ERROR', undefined);
  }

  const body = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw normalizeUserListApiError(response.status, body);
  }

  const list = body as { items: UserListApiResponse[]; pagination: UserListApiPage };
  return {
    items: list.items.map(toUserListItem),
    pagination: toUserListPagination(list.pagination),
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

  const messages: Record<string, string> = {
    'Phone is required': 'Informe o telefone.',
    'Institution is required': 'Informe a instituição.',
    'Organizational unit is required': 'Informe a unidade organizacional.',
    'Contact address is required': 'Informe o endereço de contato.',
    'Research area is required': 'Informe a área de pesquisa.',
    'Position is required': 'Informe o cargo ou vínculo.',
    'CAAE is required': 'Informe o CAAE.',
    'Opinion number is required': 'Informe o número do parecer.',
    'Approval date must be in YYYY-MM-DD format': 'Informe uma data válida.',
    'Approval date is not a valid calendar date': 'Informe uma data válida.',
    'Document filename is required': 'Anexe o parecer do COEP.',
  };

  return messages[message] ?? message;
}

function toUiField(path?: string[]) {
  const field = path?.[0];

  if (field === 'full_name') {
    return 'fullName' as const;
  }

  if (field === 'email' || field === 'password') {
    return field;
  }

  const nestedFields: Record<string, keyof NonNullable<UserApiError['fieldErrors']>> = {
    'profile.phone': 'phone',
    'profile.institution': 'institution',
    'profile.organizational_unit': 'organizationalUnit',
    'profile.contact_address': 'contactAddress',
    'researcher_profile.research_area': 'researchArea',
    'researcher_profile.position': 'position',
    'coep.caae': 'caae',
    'coep.opinion_number': 'opinionNumber',
    'coep.approval_date': 'approvalDate',
    'coep.document_filename': 'coepDocument',
  };

  if (path && path.length >= 2) {
    return nestedFields[`${path[0]}.${path[1]}`];
  }

  return undefined;
}

function normalizeValidationError(status: number, issues: ApiValidationIssue[]): UserApiError {
  const fieldErrors: UserApiError['fieldErrors'] = {};

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

export function toCreateUserFormData(input: CreateUserInput) {
  const formData = new FormData();
  formData.append('full_name', input.fullName.trim());
  formData.append('email', input.email.trim());
  formData.append('password', input.password);
  formData.append('profile', JSON.stringify({
    phone: input.profile.phone.trim(),
    institution: input.profile.institution.trim(),
    organizational_unit: input.profile.organizationalUnit.trim(),
    contact_address: input.profile.contactAddress.trim(),
  }));
  formData.append('researcher_profile', JSON.stringify({
    research_area: input.researcherProfile.researchArea.trim(),
    position: input.researcherProfile.position.trim(),
  }));
  formData.append('coep', JSON.stringify({
    caae: input.coep.caae.trim(),
    opinion_number: input.coep.opinionNumber.trim(),
    approval_date: input.coep.approvalDate,
  }));
  formData.append('coep_document', input.coep.document, input.coep.document.name);

  return formData;
}

export async function createUserRequest(input: CreateUserInput): Promise<User> {
  let response: Response;

  try {
    response = await fetch(`${getAdminApiBaseUrl()}/users`, {
      method: 'POST',
      body: toCreateUserFormData(input),
    });
  } catch {
    throw normalizeUserApiError('FETCH_ERROR', undefined);
  }

  const body = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw normalizeUserApiError(response.status, body);
  }

  return toUser(body as CreateUserApiResponse);
}

export async function downloadUserCoepDocumentRequest(userId: number): Promise<DownloadedFile> {
  let response: Response;

  try {
    response = await fetch(`${getAdminApiBaseUrl()}/users/${userId}/coep-document`, {
      headers: authHeaders(),
    });
  } catch {
    throw normalizeUserDocumentApiError('FETCH_ERROR');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => undefined);
    throw normalizeUserDocumentApiError(response.status, body);
  }

  return {
    blob: await response.blob(),
    filename: getFilenameFromContentDisposition(
      response.headers.get('Content-Disposition'),
      `parecer-coep-${userId}.pdf`,
    ),
  };
}

export function normalizeUserDocumentApiError(
  status: number | string,
  _body?: unknown,
): ApiError {
  const numericStatus = typeof status === 'number' ? status : undefined;

  if (numericStatus === 401) {
    return { status: 401, message: 'Sessão expirada. Faça login novamente.' };
  }

  if (numericStatus === 403) {
    return { status: 403, message: 'Você não tem acesso a este documento.' };
  }

  if (numericStatus === 404) {
    return { status: 404, message: 'Documento do COEP não encontrado.' };
  }

  if (numericStatus === 500) {
    return { status: 500, message: 'Erro no servidor. Tente novamente.' };
  }

  return {
    status: numericStatus,
    message: 'Não foi possível baixar o documento do COEP. Tente novamente.',
  };
}

export function normalizeUserListApiError(
  status: number | string,
  _body: unknown,
): ApiError {
  const numericStatus = typeof status === 'number' ? status : undefined;

  if (numericStatus === 401) {
    return { status: 401, message: 'Sessão expirada. Faça login novamente.' };
  }

  if (numericStatus === 403) {
    return { status: 403, message: 'Você não tem acesso a estes usuários.' };
  }

  if (numericStatus === 400 || numericStatus === 422) {
    return { status: numericStatus, message: 'Revise os filtros informados.' };
  }

  if (numericStatus === 500) {
    return { status: 500, message: 'Erro no servidor. Tente novamente.' };
  }

  return {
    status: numericStatus,
    message: 'Não foi possível carregar os usuários. Tente novamente.',
  };
}

export function normalizeUserApiError(
  status: number | string,
  body: unknown,
): UserApiError {
  const numericStatus = typeof status === 'number' ? status : undefined;

  if (numericStatus === 400 && typeof body === 'object' && body !== null && 'errors' in body) {
    const errors = (body as { errors?: unknown }).errors;

    if (Array.isArray(errors)) {
      return normalizeValidationError(numericStatus, errors as ApiValidationIssue[]);
    }
  }

  if (numericStatus === 409 && typeof body === 'object' && body !== null && 'error' in body) {
    const error = (body as { error?: unknown }).error;

    if (typeof error === 'string') {
      return {
        status: numericStatus,
        message: 'Este e-mail já está cadastrado.',
        fieldErrors: {
          email: 'Este e-mail já está cadastrado.',
        },
      };
    }
  }

  return {
    status: numericStatus,
    message: typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
      ? 'Não foi possível cadastrar o pesquisador.'
      : 'Não foi possível cadastrar o pesquisador. Tente novamente.',
  };
}
