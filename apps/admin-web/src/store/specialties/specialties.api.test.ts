import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiError, SpecialtiesList, Specialty } from '../../types/specialty.types';

const serviceMocks = vi.hoisted(() => ({
  listSpecialties: vi.fn(),
  createSpecialty: vi.fn(),
  updateSpecialty: vi.fn(),
  updateSpecialtyStatus: vi.fn(),
}));

vi.mock('../../services/specialties/admin-api', () => serviceMocks);

import { createSpecialty, fetchSpecialties, updateSpecialty, updateSpecialtyStatus } from './specialties.api';
import {
  clearSelectedSpecialty,
  clearSpecialtiesError,
  clearSpecialtiesState,
  setSelectedSpecialty,
  specialtiesReducer,
} from './specialties.slice';
import {
  selectSelectedSpecialty,
  selectSpecialties,
  selectSpecialtiesError,
  selectSpecialtiesLoading,
  selectSpecialtiesPagination,
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

const listResponse = (items: Specialty[] = [buildSpecialty()]): SpecialtiesList => ({
  items,
  pagination: { page: 1, pageSize: 20, totalItems: items.length, totalPages: items.length ? 1 : 0 },
});

const makeStore = () => configureStore({ reducer: { specialties: specialtiesReducer } });

describe('specialties thunks, reducer and selectors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fica pendente durante a busca e armazena a listagem paginada sem duplicar ids', async () => {
    let resolveRequest!: (value: SpecialtiesList) => void;
    serviceMocks.listSpecialties.mockReturnValue(new Promise((resolve) => {
      resolveRequest = resolve;
    }));
    const store = makeStore();

    const request = store.dispatch(fetchSpecialties({ query: 'epidemio', isActive: true, page: 1, pageSize: 20 }));

    expect(store.getState().specialties.status).toBe('pending');
    expect(selectSpecialtiesLoading(store.getState())).toBe(true);

    const newerSpecialty = buildSpecialty({ name: 'Epidemiologia atualizada' });
    resolveRequest(listResponse([buildSpecialty(), newerSpecialty]));
    await request;

    expect(serviceMocks.listSpecialties).toHaveBeenCalledWith({ query: 'epidemio', isActive: true, page: 1, pageSize: 20 });
    expect(selectSpecialties(store.getState())).toEqual([newerSpecialty]);
    expect(selectSpecialtiesPagination(store.getState())).toEqual({ page: 1, pageSize: 20, totalItems: 2, totalPages: 1 });
    expect(store.getState().specialties.status).toBe('succeeded');
  });

  it('expõe o erro normalizado quando um thunk é rejeitado', async () => {
    const error: ApiError = { status: 409, message: 'Nome duplicado', fieldErrors: { name: 'Nome duplicado' } };
    serviceMocks.createSpecialty.mockRejectedValue(error);
    const store = makeStore();

    await store.dispatch(createSpecialty({ code: 'epi', name: 'Epidemiologia' }));

    expect(store.getState().specialties.status).toBe('failed');
    expect(selectSpecialtiesError(store.getState())).toEqual(error);
  });

  it('adiciona a criação à lista e à seleção', async () => {
    const created = buildSpecialty();
    serviceMocks.createSpecialty.mockResolvedValue(created);
    const store = makeStore();

    await store.dispatch(createSpecialty({ code: created.code, name: created.name }));

    expect(selectSpecialties(store.getState())).toEqual([created]);
    expect(selectSelectedSpecialty(store.getState())).toEqual(created);
  });

  it('substitui a especialidade editada sem duplicar e mantém a seleção sincronizada', async () => {
    serviceMocks.listSpecialties.mockResolvedValue(listResponse());
    const updated = buildSpecialty({ name: 'Epidemiologia clínica', description: 'Nova descrição' });
    serviceMocks.updateSpecialty.mockResolvedValue(updated);
    const store = makeStore();
    await store.dispatch(fetchSpecialties(undefined));

    await store.dispatch(updateSpecialty({ id: 1, name: updated.name, description: updated.description }));

    expect(serviceMocks.updateSpecialty).toHaveBeenCalledWith(1, { name: updated.name, description: updated.description });
    expect(selectSpecialties(store.getState())).toEqual([updated]);
    expect(selectSelectedSpecialty(store.getState())).toEqual(updated);
  });

  it.each([true, false])('altera o status para %s pelo thunk dedicado, atualizando lista e seleção', async (isActive) => {
    serviceMocks.listSpecialties.mockResolvedValue(listResponse([buildSpecialty({ isActive: !isActive })]));
    const updated = buildSpecialty({ isActive });
    serviceMocks.updateSpecialtyStatus.mockResolvedValue(updated);
    const store = makeStore();
    await store.dispatch(fetchSpecialties(undefined));

    await store.dispatch(updateSpecialtyStatus({ id: 1, isActive }));

    expect(serviceMocks.updateSpecialtyStatus).toHaveBeenCalledWith(1, isActive);
    expect(selectSpecialties(store.getState())).toEqual([updated]);
    expect(selectSelectedSpecialty(store.getState())).toEqual(updated);
  });

  it('define e limpa a especialidade selecionada', () => {
    const store = makeStore();
    const specialty = buildSpecialty();

    store.dispatch(setSelectedSpecialty(specialty));
    expect(selectSelectedSpecialty(store.getState())).toEqual(specialty);

    store.dispatch(clearSelectedSpecialty());
    expect(selectSelectedSpecialty(store.getState())).toBeNull();
  });

  it('limpa o erro e restaura todo o estado', async () => {
    serviceMocks.listSpecialties.mockRejectedValue({ status: 500, message: 'Falha' });
    const store = makeStore();
    await store.dispatch(fetchSpecialties(undefined));

    store.dispatch(clearSpecialtiesError());
    expect(selectSpecialtiesError(store.getState())).toBeNull();
    expect(store.getState().specialties.status).toBe('idle');

    store.dispatch(clearSpecialtiesState());
    expect(store.getState().specialties).toEqual({
      specialties: [],
      selectedSpecialty: null,
      pagination: null,
      status: 'idle',
      error: null,
    });
  });
});
