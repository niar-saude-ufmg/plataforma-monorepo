import { configureStore } from '@reduxjs/toolkit';
import { NiarProvider } from '@niar/ui';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SpecialtiesList, Specialty } from '../../types/specialty.types';
import { adminApi } from '../../store/api/admin.api';
import authReducer from '../../store/auth/auth.slice';
import projectsReducer from '../../store/projects/projects.slice';
import {
  setSpecialtiesFilters,
  setSpecialtiesPage,
  specialtiesReducer,
} from '../../store/specialties/specialties.slice';
import usersReducer from '../../store/users/users.slice';

const serviceMocks = vi.hoisted(() => ({
  listSpecialties: vi.fn(),
  createSpecialty: vi.fn(),
  updateSpecialty: vi.fn(),
  updateSpecialtyStatus: vi.fn(),
}));

vi.mock('../../services/specialties/specialties.service', () => serviceMocks);

import { Specialties } from './Specialties';

const buildSpecialty = (overrides: Partial<Specialty> = {}): Specialty => ({
  id: 1,
  code: 'epi-001',
  name: 'Epidemiologia',
  description: 'Estudos populacionais',
  guidanceContext: '',
  isActive: true,
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:00:00.000Z',
  ...overrides,
});

const listResponse = (
  items: Specialty[] = [buildSpecialty()],
  pagination: SpecialtiesList['pagination'] = {
    page: 1,
    pageSize: 20,
    totalItems: items.length,
    totalPages: items.length ? 1 : 0,
  },
): SpecialtiesList => ({ items, pagination });

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

const renderPage = (store = makeStore()) => {
  render(
    <NiarProvider>
      <Provider store={store}>
        <Specialties />
      </Provider>
    </NiarProvider>,
  );
  return store;
};

describe('Specialties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMocks.listSpecialties.mockResolvedValue(listResponse());
  });

  it('carrega e apresenta a listagem com colunas, status e ações sem comportamento', async () => {
    serviceMocks.listSpecialties.mockResolvedValue(listResponse([
      buildSpecialty(),
      buildSpecialty({
        id: 2,
        code: 'nut-002',
        name: 'Nutrição',
        description: 'Saúde nutricional',
        isActive: false,
      }),
    ]));
    const user = userEvent.setup();

    const store = renderPage();

    expect(await screen.findByRole('heading', { name: 'Especialidades' })).toBeInTheDocument();
    expect(screen.getByText('Consulte as especialidades cadastradas na plataforma.')).toBeInTheDocument();
    expect(screen.getAllByRole('form', { name: 'Filtros de especialidades' })).toHaveLength(1);
    expect(screen.getAllByRole('table', { name: 'Lista de especialidades' })).toHaveLength(1);
    for (const column of ['Nome', 'Código', 'Descrição', 'Status', 'Ações']) {
      expect(screen.getByRole('columnheader', { name: column })).toBeInTheDocument();
    }
    expect(screen.getByText('Epidemiologia')).toBeInTheDocument();
    expect(screen.getByText('Estudos populacionais')).toBeInTheDocument();
    expect(screen.getByText('Ativa')).toBeInTheDocument();
    expect(screen.getByText('Inativa')).toBeInTheDocument();

    const stateBeforeActions = store.getState().specialties;
    await user.click(screen.getAllByRole('button', { name: 'Editar' })[0]);
    await user.click(screen.getByRole('button', { name: 'Desativar' }));
    await user.click(screen.getByRole('button', { name: 'Ativar' }));

    expect(serviceMocks.createSpecialty).not.toHaveBeenCalled();
    expect(serviceMocks.updateSpecialty).not.toHaveBeenCalled();
    expect(serviceMocks.updateSpecialtyStatus).not.toHaveBeenCalled();
    expect(store.getState().specialties).toBe(stateBeforeActions);
    expect(serviceMocks.listSpecialties).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      query: undefined,
      isActive: undefined,
    });
  });

  it('usa o Skeleton do Listing durante o carregamento', async () => {
    let resolveRequest!: (value: SpecialtiesList) => void;
    serviceMocks.listSpecialties.mockReturnValue(new Promise((resolve) => {
      resolveRequest = resolve;
    }));

    renderPage();

    expect(await screen.findAllByRole('status', { name: 'Carregando conteúdo' })).not.toHaveLength(0);

    resolveRequest(listResponse());
    expect(await screen.findByText('Epidemiologia')).toBeInTheDocument();
  });

  it('aplica busca e status pelo Filter, normaliza o Autocomplete e retorna para a página 1', async () => {
    serviceMocks.listSpecialties.mockImplementation(async (params) => listResponse(
      [buildSpecialty()],
      {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        totalItems: 60,
        totalPages: 3,
      },
    ));
    const user = userEvent.setup();
    const store = renderPage();
    await screen.findByText('Epidemiologia');

    act(() => {
      store.dispatch(setSpecialtiesPage(3));
    });
    await waitFor(() => expect(serviceMocks.listSpecialties).toHaveBeenCalledWith(expect.objectContaining({ page: 3 })));

    const query = screen.getByRole('combobox', { name: 'Buscar especialidade' });
    await user.click(query);
    expect(await screen.findByRole('option', { name: 'epi-001' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Epidemiologia' })).toBeInTheDocument();
    await user.click(await screen.findByRole('option', { name: 'Epidemiologia' }));

    await waitFor(() => expect(serviceMocks.listSpecialties).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      query: 'Epidemiologia',
      isActive: undefined,
    }));

    const status = screen.getByRole('combobox', { name: 'Status' });
    await user.click(status);
    expect(screen.queryByRole('option', { name: /^Tod[oa]s$/i })).not.toBeInTheDocument();
    await user.click(await screen.findByRole('option', { name: 'Inativa' }));

    await waitFor(() => expect(serviceMocks.listSpecialties).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      query: 'Epidemiologia',
      isActive: false,
    }));
    expect(store.getState().specialties.page).toBe(1);

    const currentStatus = await screen.findByRole('combobox', { name: 'Status' });
    expect(currentStatus).toHaveValue('Inativa');
    const statusAutocomplete = currentStatus.closest('.MuiAutocomplete-root');
    expect(statusAutocomplete).not.toBeNull();
    await user.click(within(statusAutocomplete as HTMLElement).getByTitle(/clear/i));

    await waitFor(() => expect(store.getState().specialties.filters).toEqual({ query: 'Epidemiologia' }));
    expect(serviceMocks.listSpecialties).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 20,
      query: 'Epidemiologia',
      isActive: undefined,
    });
  });

  it('diferencia os estados vazios e limpa os filtros ativos', async () => {
    serviceMocks.listSpecialties.mockImplementation(async (params) => {
      const filtered = Boolean(params?.query) || params?.isActive !== undefined;
      return listResponse([], {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        totalItems: 0,
        totalPages: 0,
      });
    });
    const user = userEvent.setup();
    const store = renderPage();

    expect(await screen.findByRole('heading', { name: 'Nenhuma especialidade cadastrada' })).toBeInTheDocument();
    expect(screen.getByText('Ainda não existem especialidades para exibir.')).toBeInTheDocument();

    act(() => {
      store.dispatch(setSpecialtiesFilters({ isActive: true }));
    });
    expect(await screen.findByRole('heading', { name: 'Nenhuma especialidade encontrada' })).toBeInTheDocument();
    expect(screen.getByText('Não encontramos especialidades com os filtros selecionados.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    await waitFor(() => expect(store.getState().specialties.filters).toEqual({}));
    expect(await screen.findByRole('heading', { name: 'Nenhuma especialidade cadastrada' })).toBeInTheDocument();
    expect(serviceMocks.listSpecialties).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 20,
      query: undefined,
      isActive: undefined,
    });
  });

  it('converte a paginação e altera a quantidade de registros por página', async () => {
    serviceMocks.listSpecialties.mockImplementation(async (params) => listResponse(
      [buildSpecialty()],
      {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        totalItems: 45,
        totalPages: Math.ceil(45 / (params?.pageSize ?? 20)),
      },
    ));
    const user = userEvent.setup();

    renderPage();
    await screen.findByText('Epidemiologia');

    await user.click(screen.getByRole('button', { name: /next page/i }));
    await waitFor(() => expect(serviceMocks.listSpecialties).toHaveBeenCalledWith(expect.objectContaining({ page: 2 })));
    expect(await screen.findByText(/21.*40 of 45/)).toBeInTheDocument();

    const rowsPerPage = screen.getByRole('combobox', { name: /rows per page/i });
    fireEvent.mouseDown(rowsPerPage);
    await user.click(await screen.findByRole('option', { name: '50' }));

    await waitFor(() => expect(serviceMocks.listSpecialties).toHaveBeenCalledWith({
      page: 1,
      pageSize: 50,
      query: undefined,
      isActive: undefined,
    }));
  });

  it('exibe o erro no Snackbar sem EmptyState e permite tentar novamente', async () => {
    serviceMocks.listSpecialties.mockRejectedValueOnce({ message: 'Falha ao carregar especialidades.' });
    const user = userEvent.setup();
    const store = makeStore();
    store.dispatch(setSpecialtiesFilters({ query: 'epi', isActive: true }));
    store.dispatch(setSpecialtiesPage(2));

    renderPage(store);

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao carregar especialidades.');
    expect(screen.queryByText('Nenhuma especialidade cadastrada')).not.toBeInTheDocument();
    expect(serviceMocks.listSpecialties).toHaveBeenNthCalledWith(1, {
      page: 2,
      pageSize: 20,
      query: 'epi',
      isActive: true,
    });

    serviceMocks.listSpecialties.mockResolvedValueOnce(listResponse(
      [buildSpecialty()],
      { page: 2, pageSize: 20, totalItems: 21, totalPages: 2 },
    ));
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Epidemiologia')).toBeInTheDocument();
    expect(serviceMocks.listSpecialties).toHaveBeenCalledTimes(2);
    expect(serviceMocks.listSpecialties).toHaveBeenNthCalledWith(2, {
      page: 2,
      pageSize: 20,
      query: 'epi',
      isActive: true,
    });
  });
});
