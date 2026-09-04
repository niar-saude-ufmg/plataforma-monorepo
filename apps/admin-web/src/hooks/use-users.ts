/**
 * CONTRATO DOS HOOKS DE USUÁRIOS — escopo atual: só o cadastro.
 *
 * Este arquivo define o contrato público do hook de usuários para as telas.
 * A implementação real fica em `use-users.query.ts`, para manter a UI separada
 * da estratégia de acesso à API.
 *
 * ATENÇÃO (atualização de escopo): useUsers/useQuery, a query key da listagem
 * e o invalidateQueries saíram desta entrega. Fica só o useMutation do cadastro.
 */

import type { ApiError, CreateUserInput, User } from '../types/user';

/** O que `useCreateUser()` precisa devolver (subconjunto de UseMutationResult). */
export interface UseCreateUserResult {
  /** Resolve com o usuário criado; rejeita com ApiError. */
  mutateAsync: (input: CreateUserInput) => Promise<User>;
  isPending: boolean;
  error: ApiError | null;
  reset: () => void;
}

/**
 * Esboço da implementação real, para referência do time de integração:
 *
 * ```ts
 * export function useCreateUser(): UseCreateUserResult {
 *   return useMutation<User, ApiError, CreateUserInput>({
 *     mutationFn: adminApi.createUser,
 *   });
 * }
 * ```
 *
 * (Sem invalidateQueries: não há listagem nesta entrega.)
 */

export { useCreateUser } from './use-users.query';
