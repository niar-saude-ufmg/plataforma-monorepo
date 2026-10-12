import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAdminApiBaseUrl } from '../../services/auth/auth.service';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getAdminApiBaseUrl(),
  }),
  endpoints: () => ({}),
});
