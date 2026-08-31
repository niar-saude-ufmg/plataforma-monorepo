/**
 * Mock temporário do hook de cadastro.
 *
 * Serve só para desenvolver e revisar a tela enquanto a integração real não
 * existe. Não usa React Query de propósito: quando o hook real chegar,
 * este arquivo é apagado.
 *
 * Para testar os estados da tela sem backend, use a query string:
 *   ?mock=error   -> a API sempre devolve erro no cadastro
 *
 * Cadastrar duas vezes o mesmo e-mail também simula o erro 409 do backend.
 */

import { useCallback, useState } from 'react';
import type { ApiError, CreateUserInput, User } from '../types/user';
import type { UseCreateUserResult } from './use-users';

function readScenario(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('mock');
}

// E-mails já "cadastrados" nesta sessão, para simular duplicidade.
const registeredEmails = new Set<string>(['isadora.almeida@niar-saude.org']);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useCreateUser(): UseCreateUserResult {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutateAsync = useCallback(async (input: CreateUserInput): Promise<User> => {
    setIsPending(true);
    setError(null);
    await delay(700);

    if (readScenario() === 'error') {
      const apiError: ApiError = {
        message: 'Não foi possível concluir a operação.',
        status: 500,
      };
      setError(apiError);
      setIsPending(false);
      throw apiError;
    }

    const email = input.email.trim().toLowerCase();

    if (registeredEmails.has(email)) {
      const apiError: ApiError = {
        message: 'Este e-mail já está cadastrado.',
        status: 409,
        fieldErrors: { email: 'Este e-mail já está cadastrado.' },
      };
      setError(apiError);
      setIsPending(false);
      throw apiError;
    }

    registeredEmails.add(email);

    const created: User = {
      id: crypto.randomUUID(),
      fullName: input.fullName.trim(),
      email,
      role: input.role,
      createdAt: new Date().toISOString(),
    };

    setIsPending(false);
    return created;
  }, []);

  return {
    mutateAsync,
    isPending,
    error,
    reset: () => setError(null),
  };
}
