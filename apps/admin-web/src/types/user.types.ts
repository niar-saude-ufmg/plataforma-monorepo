import type { ChangeEvent, ReactNode } from 'react';
import type { UserAccountStatus, UserRole as ContractUserRole } from '@niar/contracts';
import type { ApiError } from "./api.types";

/**
 * Contratos de dados usados pela interface do admin.
 *
 * Regra: a UI só conhece estes tipos. Se o backend mudar o formato,
 * a tradução acontece no service (services/users/users.service.ts), nunca dentro das telas.
 */

/** Papéis suportados pela aplicação administrativa. */
export type UserRole = ContractUserRole;

export type UserRoleOption = {
  label: string;
  value: UserRole;
};

export interface AuthProfile {
  phone: string | null;
  institution: string | null;
  organizationalUnit: string | null;
  contactAddress: string | null;
}

export interface AuthResearcherProfile {
  researchArea: string | null;
  position: string | null;
}

export interface AuthCoepData {
  caae: string;
  opinionNumber: string;
  approvalDate: string;
  documentFilename: string;
}

export interface AuthCommitteeProfile {
  specialty: {
    id: number;
    code: string;
    name: string;
  };
}

/** Usuário autenticado disponível para as telas da plataforma. */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  accountStatus: UserAccountStatus;
  profile?: AuthProfile;
  researcherProfile?: AuthResearcherProfile;
  coep?: AuthCoepData;
  committeeProfile?: AuthCommitteeProfile;
}

/** Entrada do cadastro como a UI produz (camelCase). */
export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  profile: {
    phone: string;
    institution: string;
    organizationalUnit: string;
    contactAddress: string;
  };
  researcherProfile: {
    researchArea: string;
    position: string;
  };
  coep: {
    caae: string;
    opinionNumber: string;
    approvalDate: string;
    document: File;
  };
}

/** Entrada do cadastro privado de Administrador — só campos básicos. */
export interface CreateAdministratorInput {
  fullName: string;
  email: string;
  password: string;
}

/** Entrada do cadastro privado de Auditor — só campos básicos. */
export interface CreateAuditorInput {
  fullName: string;
  email: string;
  password: string;
}

/** Entrada do cadastro privado de Membro do Comitê — básicos + especialidade. */
export interface CreateCommitteeMemberInput {
  fullName: string;
  email: string;
  password: string;
  specialtyId: number;
}

/** Usuário como a tela precisa dele (resposta do POST, já normalizada pelo service). */
export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  /** Data ISO 8601 vinda da API, ex.: "2026-08-27T13:45:00.000Z" */
  createdAt: string;
}

export interface UserListProfile {
  phone: string | null;
  institution: string | null;
  organizationalUnit: string | null;
  contactAddress: string | null;
}

export interface UserListResearcherProfile {
  researchArea: string | null;
  position: string | null;
}

export interface UserListCommitteeProfile {
  specialty: {
    id: number;
    code: string;
    name: string;
  };
}

export interface UserListCoep {
  caae: string;
  opinionNumber: string;
  approvalDate: string;
  documentFilename: string;
}

export interface UserListEvaluation {
  id: number;
  userId: number;
  status: UserAccountStatus;
  justification: string | null;
  evaluatedByUserId: number | null;
  evaluatedAt: string | null;
  createdAt: string;
  userCoepDataId: number | null;
}

/** Usuário consolidado usado nas listagens administrativas. */
export interface UserListItem extends User {
  accountStatus: UserAccountStatus;
  profile: UserListProfile | null;
  researcherProfile: UserListResearcherProfile | null;
  committeeProfile: UserListCommitteeProfile | null;
  coep: UserListCoep | null;
  latestAuthEvaluation: UserListEvaluation | null;
}

export interface UserListParams {
  search?: string;
  role?: UserRole;
  accountStatus?: UserAccountStatus;
  page?: number;
  pageSize?: number;
}

export type UserListFilters = Pick<UserListParams, 'search' | 'role' | 'accountStatus'>;

export interface UserListPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface UserListResponse {
  items: UserListItem[];
  pagination: UserListPagination;
}

export interface UserFormFieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  phone?: string;
  institution?: string;
  organizationalUnit?: string;
  contactAddress?: string;
  researchArea?: string;
  position?: string;
  caae?: string;
  opinionNumber?: string;
  approvalDate?: string;
  coepDocument?: string;
  specialtyId?: string;
}

/* Erro de API específico do cadastro de usuário, com detalhes de validação por campo. */
export interface UserApiError extends ApiError {
  fieldErrors?: UserFormFieldErrors;
}

export type UserTextField = {
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: () => void;
  error?: boolean;
  helperText?: ReactNode;
};

export type UserFileField = {
  onChange: (file?: File) => void;
  error?: string;
};

export type SharedUserFormFields = {
  fullName: UserTextField;
  email: UserTextField;
  password: UserTextField;
  passwordConfirmation: UserTextField;
};

export type ResearcherProfileFormFields = {
  phone: UserTextField;
  institution: UserTextField;
  organizationalUnit: UserTextField;
  contactAddress: UserTextField;
  researchArea: UserTextField;
  position: UserTextField;
};

export type CoepUserFormFields = {
  caae: UserTextField;
  opinionNumber: UserTextField;
  approvalDate: UserTextField;
  coepDocument: UserFileField;
};

export type CommitteeSpecialtyOption = {
  label: string;
  value: string;
};

export type CommitteeProfileFormFields = {
  specialtyId: {
    name: string;
    value: CommitteeSpecialtyOption | null;
    options: CommitteeSpecialtyOption[];
    onChange: (option: CommitteeSpecialtyOption | null) => void;
    onBlur: () => void;
    loading?: boolean;
    error?: boolean;
    helperText?: ReactNode;
  };
};

export type RoleFormFields = {
  role: {
    name: string;
    value: UserRole | '';
    options: readonly UserRoleOption[];
    onChange: (role: UserRole | '') => void;
    onBlur: () => void;
    error?: boolean;
    helperText?: ReactNode;
  };
};
export interface AuthFormFieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  password?: string;
}

export interface AuthApiError extends ApiError {
  fieldErrors?: AuthFormFieldErrors;
}

export interface UpdateProfileInput {
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  password: string;
}
