import { adminApi } from '../api/admin.api';
import {
  normalizeUserApiError,
  toCreateUserFormData,
  toUser,
} from '../../services/users/admin-api';
import type { CreateUserInput, User } from '../../types/user.types';

export const usersApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation<User, CreateUserInput>({
      query: (input) => ({
        url: '/users',
        method: 'POST',
        body: toCreateUserFormData(input),
      }),
      transformResponse: (response: Parameters<typeof toUser>[0]) => toUser(response),
      transformErrorResponse: (response) =>
        normalizeUserApiError(response.status, response.data),
    }),
  }),
});

export const { useCreateUserMutation } = usersApi;
