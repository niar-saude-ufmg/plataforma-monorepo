/**
 * CONTRATO DOS HOOKS DE USUÁRIOS — escopo atual: só o cadastro.
 *
 * A implementação real (React Query + admin-api) é responsabilidade do time de
 * integração. Este arquivo define o formato que as telas esperam e, enquanto a
 * versão real não chega, reexporta a versão mock para o front rodar sozinho.
 *
 * PARA LIGAR NA API DE VERDADE: troque a linha de reexport lá embaixo por
 *
 *   export { useCreateUser } from './use-users.query';
 *
 * e apague o import do mock. Nenhum componente precisa ser alterado.
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

export { useCreateUser } from './use-users.mock';
