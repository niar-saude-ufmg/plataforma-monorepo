import type { ApiError } from './api.types';

export type Specialty = {
  id: number;
  code: string;
  name: string;
  description: string;
  guidanceContext: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SpecialtiesPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type SpecialtiesList = {
  items: Specialty[];
  pagination: SpecialtiesPagination;
};

export type FetchSpecialtiesParams = {
  query?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
};

export type SpecialtiesFilters = Pick<FetchSpecialtiesParams, 'query' | 'isActive'>;

export type CreateSpecialtyInput = {
  code: string;
  name: string;
  description?: string;
  guidanceContext?: string;
};

export type UpdateSpecialtyInput = {
  name?: string;
  description?: string;
  guidanceContext?: string;
};

export type UpdateSpecialtyRequest = UpdateSpecialtyInput & {
  id: number;
};

export type UpdateSpecialtyStatusRequest = {
  id: number;
  isActive: boolean;
};

export type SpecialtyField = 'code' | 'name' | 'description' | 'guidanceContext' | 'isActive';

export interface SpecialtyApiError extends ApiError {
  fieldErrors?: Partial<Record<SpecialtyField, string>>;
}
