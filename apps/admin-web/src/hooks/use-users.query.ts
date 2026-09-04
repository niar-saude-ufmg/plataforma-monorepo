import { useMutation } from '@tanstack/react-query';
import { createUser } from '../services/admin-api';
import type { ApiError, CreateUserInput, User } from '../types/user';

export function useCreateUser() {
  return useMutation<User, ApiError, CreateUserInput>({
    mutationFn: createUser,
  });
}
