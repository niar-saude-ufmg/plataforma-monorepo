import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SpecialtyListResponse, Specialty, SpecialtyApiError } from '../../types/specialty.types';
import authReducer from '../auth/auth.slice';
import { adminApi } from '../api/admin.api';
import projectsReducer from '../projects/projects.slice';
import usersReducer from '../users/users.slice';

const serviceMocks = vi.hoisted(() => ({
  listSpecialties: vi.fn(),
  createSpecialty: vi.fn(),
  updateSpecialty: vi.fn(),
  updateSpecialtyStatus: vi.fn(),
}));

vi.mock('../../services/specialties/specialties.service', () => serviceMocks);

import { createSpecialty, fetchSpecialties, updateSpecialty, updateSpecialtyStatus } from './specialties.api';
import {
  clearSelectedSpecialty,
  clearSpecialtiesError,
  clearSpecialtiesState,
  setSelectedSpecialty,
  specialtiesReducer,
  initialSpecialtiesState,
} from './specialties.slice';
import {
  selectSpecialtiesSelected,
  selectSpecialtiesList,
  selectSpecialtiesMutationError,
  selectSpecialtiesMutationLoading,
  selectSpecialtiesListError,
  selectSpecialtiesListLoading,
  selectSpecialtiesListPagination,
  selectSpecialtiesListStatus,
} from './specialties.selectors';

const buildSpecialty = (overrides: Partial<Specialty> = {}): Specialty => ({
  id: 1,
  code: 'epidemiology',
  name: 'Epidemiologia',
  description: '',
  guidanceContext: '',
  isActive: true,
  createdAt: '2026-09-04T10:00:00.000Z',
  updatedAt: '2026-09-04T10:00:00.000Z',
  ...overrides,
});

const listResponse = (items: Specialty[] = [buildSpecialty()]): SpecialtyListResponse => ({
  items,
  pagination: { page: 1, pageSize: 20, totalItems: items.length, totalPages: items.length ? 1 : 0 },
});

const makeStore = () => configureStore({
  reducer: {
    auth: authReducer,
    specialties: specialtiesReducer,
    users: usersReducer,
    projects: projectsReducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(adminApi.middleware),
});

describe('specialties thunks, reducer and selectors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fica pendente durante a busca e armazena a listagem paginada', async () => {
    let resolveRequest!: (value: SpecialtyListResponse) => void;
    serviceMocks.listSpecialties.mockReturnValue(new Promise((resolve) => {
      resolveRequest = resolve;
    }));
    const store = makeStore();

    const request = store.dispatch(fetchSpecialties({ query: 'epidemio', isActive: true, page: 1, pageSize: 20 }));

    expect(store.getState().specialties.list.status).toBe('pending');
    expect(selectSpecialtiesListLoading(store.getState())).toBe(true);

    const newerSpecialty = buildSpecialty({ name: 'Epidemiologia atualizada' });
    resolveRequest(listResponse([newerSpecialty]));
    await request;

    expect(serviceMocks.listSpecialties).toHaveBeenCalledWith({ query: 'epidemio', isActive: true, page: 1, pageSize: 20 });
    expect(selectSpecialtiesList(store.getState())).toEqual([newerSpecialty]);
    expect(selectSpecialtiesListPagination(store.getState())).toEqual({ page: 1, pageSize: 20, totalItems: 1, totalPages: 1 });
    expect(store.getState().specialties.list.filters).toEqual({ query: 'epidemio', isActive: true });
    expect(store.getState().specialties.list.page).toBe(1);
    expect(store.getState().specialties.list.pageSize).toBe(20);
    expect(store.getState().specialties.list.status).toBe('succeeded');
  });

  it('expõe o erro normalizado quando um thunk é rejeitado', async () => {
    const error: SpecialtyApiError = { status: 409, message: 'Nome duplicado', fieldErrors: { name: 'Nome duplicado' } };
    serviceMocks.createSpecialty.mockRejectedValue(error);
    const store = makeStore();

    await store.dispatch(createSpecialty({ code: 'epi', name: 'Epidemiologia' }));

    expect(store.getState().specialties.mutation.status).toBe('failed');
    expect(selectSpecialtiesMutationError(store.getState())).toEqual(error);
    expect(selectSpecialtiesListError(store.getState())).toBeNull();
  });

  it('adiciona a criação à lista e à seleção', async () => {
    const created = buildSpecialty();
    serviceMocks.createSpecialty.mockResolvedValue(created);
    serviceMocks.listSpecialties.mockResolvedValue(listResponse([created]));
    const store = makeStore();

    await store.dispatch(createSpecialty({ code: created.code, name: created.name }));

    expect(selectSpecialtiesList(store.getState())).toEqual([created]);
    expect(selectSpecialtiesSelected(store.getState())).toEqual(created);
  });

  it('atualiza a lista após editar sem duplicar e mantém a seleção sincronizada', async () => {
    const updated = buildSpecialty({ name: 'Epidemiologia clínica', description: 'Nova descrição' });
    serviceMocks.listSpecialties
      .mockResolvedValueOnce(listResponse())
      .mockResolvedValueOnce(listResponse([updated]));
    serviceMocks.updateSpecialty.mockResolvedValue(updated);
    const store = makeStore();
    await store.dispatch(fetchSpecialties(undefined));

    await store.dispatch(updateSpecialty({ id: 1, name: updated.name, description: updated.description }));

    expect(serviceMocks.updateSpecialty).toHaveBeenCalledWith(1, { name: updated.name, description: updated.description });
    expect(selectSpecialtiesList(store.getState())).toEqual([updated]);
    expect(selectSpecialtiesSelected(store.getState())).toEqual(updated);
  });

  it.each(['create', 'update', 'status'] as const)('preserva filtros, página e pageSize após %s', async (operation) => {
    const filters = { query: 'epidemio', isActive: true, page: 2, pageSize: 10 };
    const updated = buildSpecialty({ name: 'Epidemiologia clínica' });
    serviceMocks.listSpecialties
      .mockResolvedValueOnce(listResponse([buildSpecialty()]))
      .mockResolvedValueOnce(listResponse([updated]));
    serviceMocks.createSpecialty.mockResolvedValue(updated);
    serviceMocks.updateSpecialty.mockResolvedValue(updated);
    serviceMocks.updateSpecialtyStatus.mockResolvedValue(updated);
    const store = makeStore();

    await store.dispatch(fetchSpecialties(filters));
    if (operation === 'create') await store.dispatch(createSpecialty({ code: updated.code, name: updated.name }));
    else if (operation === 'update') await store.dispatch(updateSpecialty({ id: updated.id, name: updated.name }));
    else await store.dispatch(updateSpecialtyStatus({ id: updated.id, isActive: false }));

    expect(serviceMocks.listSpecialties).toHaveBeenNthCalledWith(2, filters);
    expect(selectSpecialtiesList(store.getState())).toEqual([updated]);
  });

  it.each([true, false])('altera o status para %s pelo thunk dedicado, atualizando lista e seleção', async (isActive) => {
    const initial = buildSpecialty({ isActive: !isActive });
    const updated = buildSpecialty({ isActive });
    serviceMocks.listSpecialties
      .mockResolvedValueOnce(listResponse([initial]))
      .mockResolvedValueOnce(listResponse([updated]));
    serviceMocks.updateSpecialtyStatus.mockResolvedValue(updated);
    const store = makeStore();
    await store.dispatch(fetchSpecialties(undefined));

    await store.dispatch(updateSpecialtyStatus({ id: 1, isActive }));

    expect(serviceMocks.updateSpecialtyStatus).toHaveBeenCalledWith(1, isActive);
    expect(selectSpecialtiesList(store.getState())).toEqual([updated]);
    expect(selectSpecialtiesSelected(store.getState())).toEqual(updated);
  });

  it('mantém o estado da consulta independente durante uma mutação', async () => {
    serviceMocks.listSpecialties.mockResolvedValue(listResponse());
    let resolveMutation!: (value: Specialty) => void;
    serviceMocks.updateSpecialty.mockReturnValue(new Promise((resolve) => {
      resolveMutation = resolve;
    }));
    const store = makeStore();
    await store.dispatch(fetchSpecialties({ isActive: true, page: 1, pageSize: 20 }));

    const request = store.dispatch(updateSpecialty({ id: 1, name: 'Novo nome' }));

    expect(selectSpecialtiesListLoading(store.getState())).toBe(false);
    expect(selectSpecialtiesListStatus(store.getState())).toBe('succeeded');
    expect(selectSpecialtiesMutationLoading(store.getState())).toBe(true);
    expect(store.getState().specialties.mutation.operation).toBe('update');

    resolveMutation(buildSpecialty({ name: 'Novo nome' }));
    await request;

    expect(selectSpecialtiesListLoading(store.getState())).toBe(false);
    expect(selectSpecialtiesListStatus(store.getState())).toBe('succeeded');
  });

  it('preserva o erro da consulta quando o refresh falha após salvar', async () => {
    serviceMocks.createSpecialty.mockResolvedValue(buildSpecialty());
    serviceMocks.listSpecialties.mockRejectedValue({ message: 'Falha na consulta.' });
    const store = makeStore();
    await store.dispatch(createSpecialty({ code: 'epi', name: 'Epidemiologia' }));
    expect(selectSpecialtiesListError(store.getState())).toEqual({ message: 'Falha na consulta.' });
    expect(selectSpecialtiesMutationError(store.getState())).toBeNull();
    expect(store.getState().specialties.mutation.status).toBe('succeeded');
  });

  it('define e limpa a especialidade selecionada', () => {
    const store = makeStore();
    const specialty = buildSpecialty();

    store.dispatch(setSelectedSpecialty(specialty));
    expect(selectSpecialtiesSelected(store.getState())).toEqual(specialty);

    store.dispatch(clearSelectedSpecialty());
    expect(selectSpecialtiesSelected(store.getState())).toBeNull();
  });

  it('limpa o erro e restaura todo o estado', async () => {
    serviceMocks.listSpecialties.mockRejectedValue({ status: 500, message: 'Falha' });
    const store = makeStore();
    await store.dispatch(fetchSpecialties(undefined));

    store.dispatch(clearSpecialtiesError());
    expect(selectSpecialtiesListError(store.getState())).toBeNull();
    expect(store.getState().specialties.list.status).toBe('idle');

    store.dispatch(clearSpecialtiesState());
    expect(store.getState().specialties).toEqual(initialSpecialtiesState);
  });
});
