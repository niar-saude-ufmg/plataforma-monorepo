/**
 * Erro normalizado da API.
 * Compartilhado entre todos os módulos (users, projects, ...).
 */
export interface ApiError {
  message: string;
  status?: number;
}
