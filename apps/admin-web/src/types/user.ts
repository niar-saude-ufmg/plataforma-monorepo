/**
 * Contratos de dados usados pela interface do admin.
 *
 * Regra: a UI só conhece estes tipos. Se o backend mudar o formato,
 * a tradução acontece no service (admin-api.ts), nunca dentro das telas.
 *
 * ESCOPO ATUAL: somente cadastro de pesquisador. O role não é escolhido
 * na tela — a UI envia sempre 'researcher'.
 */

/** Único perfil criado nesta entrega. Outros perfis voltam na tarefa da gestão de usuários. */
export type UserRole = 'researcher';

/**
 * Entrada do cadastro como a UI produz (camelCase).
 * O service traduz para o formato da API antes de enviar.
 */
export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

/**
 * Payload exatamente como a API espera no POST /api/admin/users (snake_case).
 * Quem monta este objeto é o service, a partir de CreateUserInput:
 *
 * { full_name: input.fullName, email: input.email, password: input.password, role: input.role }
 */
export interface CreateUserPayload {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
}

/** Usuário como a tela precisa dele (resposta do POST, já normalizada pelo service). */
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  /** Data ISO 8601 vinda da API, ex.: "2026-08-27T13:45:00.000Z" */
  createdAt: string;
}

/**
 * Erro normalizado da API.
 * `fieldErrors` permite mostrar a mensagem do backend embaixo do campo certo
 * (ex.: e-mail já cadastrado).
 */
export interface ApiError {
  message: string;
  status?: number;
  fieldErrors?: Partial<Record<'fullName' | 'email' | 'password', string>>;
}
