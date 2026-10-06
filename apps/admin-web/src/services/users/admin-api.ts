import type { ApiError, CreateUserInput, User } from '../../types/user.types';

type ApiValidationIssue = {
  message: string;
  path?: string[];
};

type CreateUserApiResponse = {
  id: number;
  full_name: string;
  email: string;
  role: 'researcher' | 'admin' | 'committee';
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

export function toUser(response: CreateUserApiResponse): User {
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

  const nestedFields: Record<string, keyof NonNullable<ApiError['fieldErrors']>> = {
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

export function normalizeUserApiError(
  status: number | string,
  body: unknown,
): ApiError {
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
