import type { ChangeEvent, ReactNode } from 'react';

/**
 * Contratos de dados usados pela interface do admin.
 *
 * Regra: a UI só conhece estes tipos. Se o backend mudar o formato,
 * a tradução acontece no service (admin-api.ts), nunca dentro das telas.
 */

/** Único perfil criado nesta entrega. Outros perfis voltam na tarefa da gestão de usuários. */
export type UserRole = 'researcher' | 'admin' | 'committee';

/** Usuário autenticado disponível para as telas da plataforma. */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
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

/** Usuário como a tela precisa dele (resposta do POST, já normalizada pelo service). */
export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  /** Data ISO 8601 vinda da API, ex.: "2026-08-27T13:45:00.000Z" */
  createdAt: string;
}

/** Erro normalizado da API. */
export interface ApiError {
  message: string;
  status?: number;
  fieldErrors?: Partial<Record<
    | 'fullName'
    | 'email'
    | 'password'
    | 'passwordConfirmation'
    | 'phone'
    | 'institution'
    | 'organizationalUnit'
    | 'contactAddress'
    | 'researchArea'
    | 'position'
    | 'caae'
    | 'opinionNumber'
    | 'approvalDate'
    | 'coepDocument',
    string
  >>;
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
