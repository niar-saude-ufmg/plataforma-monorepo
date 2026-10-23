import { configureStore } from '@reduxjs/toolkit';
import { NiarProvider } from '@niar/ui';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SpecialtyListResponse, Specialty } from '../../types/specialty.types';
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
  pagination: SpecialtyListResponse['pagination'] = {
    page: 1,
    pageSize: 20,
    totalItems: items.length,
    totalPages: items.length ? 1 : 0,
  },
): SpecialtyListResponse => ({ items, pagination });

const makeStore = () => configureStore({
  reducer: {
    auth: authReducer,
    specialties: specialtiesReducer,
    users: usersReducer,
    projects: projectsReducer,
  },
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

  it('carrega e apresenta a listagem com colunas, status e ações', async () => {
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
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Especialidades' })).toBeInTheDocument();
    expect(screen.getByText('Gerencie o catálogo de especialidades da plataforma.')).toBeInTheDocument();
    expect(screen.getAllByRole('form', { name: 'Filtros de especialidades' })).toHaveLength(1);
    expect(screen.getAllByRole('table', { name: 'Lista de especialidades' })).toHaveLength(1);
    const table = screen.getByRole('table', { name: 'Lista de especialidades' });
    expect(within(table).getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Código',
      'Especialidade',
      'Status',
      'Descrição',
      'Ações',
    ]);
    expect(screen.getByText('Epidemiologia')).toBeInTheDocument();
    expect(screen.getByText('Estudos populacionais')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Ativas' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Inativas' })).toBeInTheDocument();
    expect(screen.getByText('Ativa')).toBeInTheDocument();
    expect(screen.getByText('Inativa')).toBeInTheDocument();

    expect(serviceMocks.listSpecialties).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      query: undefined,
      isActive: undefined,
    });
  });

  it('cadastra em formulário na página e retorna à tabela atualizada', async () => {
    serviceMocks.listSpecialties.mockResolvedValueOnce(listResponse([])).mockResolvedValue(listResponse());
    serviceMocks.createSpecialty.mockResolvedValue(buildSpecialty());
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Cadastrar especialidade' }));
    const form = within(screen.getByRole('form', { name: 'Formulário de especialidade' }));
    expect(screen.getByRole('heading', { name: 'Cadastrar especialidade' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(form.getByLabelText(/Código/)).toHaveValue('');
    expect(form.getByLabelText(/Nome/)).toHaveValue('');
    expect(form.getByLabelText('Descrição')).toHaveValue('');
    expect(form.getByLabelText('Contexto de orientação')).toHaveValue('');
    await user.click(form.getByRole('button', { name: 'Cadastrar' }));
    expect(await form.findByText('Informe o código.')).toBeInTheDocument();
    expect(serviceMocks.createSpecialty).not.toHaveBeenCalled();
    await user.type(form.getByLabelText(/Código/), 'epi-001');
    await user.type(form.getByLabelText(/Nome/), 'Epidemiologia');
    await user.click(form.getByRole('button', { name: 'Cadastrar' }));
    await waitFor(() => expect(screen.queryByRole('form', { name: 'Formulário de especialidade' })).not.toBeInTheDocument());
    expect(serviceMocks.createSpecialty).toHaveBeenCalledWith({ code: 'epi-001', name: 'Epidemiologia', description: '', guidanceContext: '' });
    expect(await screen.findByText('Epidemiologia')).toBeInTheDocument();
    expect(serviceMocks.listSpecialties).toHaveBeenCalledTimes(2);
  });

  it('mantém o cadastro após conflito de código e permite corrigir e reenviar', async () => {
    serviceMocks.createSpecialty.mockRejectedValueOnce({
      message: 'Código já cadastrado.', fieldErrors: { code: 'Código já cadastrado.' },
    }).mockResolvedValue(buildSpecialty());
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Cadastrar especialidade' }));
    await user.type(screen.getByLabelText(/Código/), 'duplicado');
    await user.type(screen.getByLabelText(/Nome/), 'Epidemiologia');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Código já cadastrado.');
    expect(screen.getByLabelText(/Código/)).toHaveValue('duplicado');
    expect(screen.getByLabelText(/Nome/)).toHaveValue('Epidemiologia');
    expect(serviceMocks.listSpecialties).toHaveBeenCalledTimes(1);
    await user.clear(screen.getByLabelText(/Código/));
    await user.type(screen.getByLabelText(/Código/), 'epi-001');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));
    await waitFor(() => expect(screen.queryByRole('form', { name: 'Formulário de especialidade' })).not.toBeInTheDocument());
    expect(serviceMocks.createSpecialty).toHaveBeenCalledTimes(2);
    expect(serviceMocks.listSpecialties).toHaveBeenCalledTimes(2);
  });

  it('edita os dados da linha sem nova consulta e preserva filtros e paginação ao salvar', async () => {
    const updated = buildSpecialty({ name: 'Epidemiologia clínica' });
    serviceMocks.listSpecialties.mockResolvedValueOnce(listResponse()).mockResolvedValue(listResponse([updated]));
    serviceMocks.updateSpecialty.mockResolvedValue(updated);
    const user = userEvent.setup();
    const store = makeStore();
    store.dispatch(setSpecialtiesFilters({ query: 'epi', isActive: true }));
    store.dispatch(setSpecialtiesPage(2));
    renderPage(store);
    await user.click(await screen.findByRole('button', { name: 'Editar' }));
    const form = within(screen.getByRole('form', { name: 'Formulário de especialidade' }));
    expect(screen.getByRole('heading', { name: 'Editar especialidade' })).toBeInTheDocument();
    expect(screen.getByText('Ativa')).toBeInTheDocument();
    expect(form.getByLabelText(/Código/)).toHaveValue('epi-001');
    expect(form.getByLabelText(/Código/)).toBeDisabled();
    expect(form.getByLabelText('Descrição')).toHaveValue('Estudos populacionais');
    expect(serviceMocks.listSpecialties).toHaveBeenCalledTimes(1);
    await user.clear(form.getByLabelText(/Nome/));
    await user.type(form.getByLabelText(/Nome/), updated.name);
    await user.click(form.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(screen.queryByRole('form', { name: 'Formulário de especialidade' })).not.toBeInTheDocument());
    expect(serviceMocks.updateSpecialty).toHaveBeenCalledWith(1, { name: updated.name, description: updated.description, guidanceContext: '' });
    expect(serviceMocks.listSpecialties).toHaveBeenLastCalledWith({ query: 'epi', isActive: true, page: 2, pageSize: 20 });
    expect(await screen.findByText(updated.name)).toBeInTheDocument();
    expect(store.getState().specialties.selected).toBeNull();
  });

  it('descarta alterações ao cancelar e retorna à listagem sem salvar', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Editar' }));
    await user.clear(screen.getByLabelText(/Nome/));
    await user.type(screen.getByLabelText(/Nome/), 'Alteração não salva');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('table', { name: 'Lista de especialidades' })).toBeInTheDocument();
    expect(serviceMocks.updateSpecialty).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Editar' }));
    expect(screen.getByLabelText(/Nome/)).toHaveValue('Epidemiologia');
    expect(serviceMocks.listSpecialties).toHaveBeenCalledTimes(1);
  });

  it.each([true, false])('confirma a alteração de status de %s e atualiza o chip', async (isActive) => {
    serviceMocks.listSpecialties.mockResolvedValueOnce(listResponse([buildSpecialty({ isActive })]))
      .mockResolvedValue(listResponse([buildSpecialty({ isActive: !isActive })]));
    serviceMocks.updateSpecialtyStatus.mockResolvedValue(buildSpecialty({ isActive: !isActive }));
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: isActive ? 'Desativar' : 'Ativar' }));
    expect(serviceMocks.updateSpecialtyStatus).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: isActive ? 'Desativar' : 'Ativar' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: isActive ? 'Desativar' : 'Ativar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(serviceMocks.updateSpecialtyStatus).toHaveBeenCalledWith(1, !isActive);
    expect(await screen.findByText(isActive ? 'Inativa' : 'Ativa')).toBeInTheDocument();
  });

  it('bloqueia confirmação e cancelamento enquanto altera o status', async () => {
    let resolveMutation!: (value: Specialty) => void;
    serviceMocks.updateSpecialtyStatus.mockReturnValue(new Promise((resolve) => { resolveMutation = resolve; }));
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Desativar' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Desativar' }));
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByRole('button', { name: 'Salvando…' })).toBeDisabled();
    expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => resolveMutation(buildSpecialty({ isActive: false })));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(serviceMocks.updateSpecialtyStatus).toHaveBeenCalledTimes(1);
  });

  it('mantém a confirmação após erro e remove do filtro ativo após uma nova tentativa bem-sucedida', async () => {
    serviceMocks.listSpecialties.mockResolvedValueOnce(listResponse()).mockResolvedValue(listResponse([]));
    serviceMocks.updateSpecialtyStatus.mockRejectedValueOnce({ message: 'Falha ao desativar.' })
      .mockResolvedValue(buildSpecialty({ isActive: false }));
    const user = userEvent.setup();
    const store = makeStore();
    store.dispatch(setSpecialtiesFilters({ isActive: true }));
    renderPage(store);
    await user.click(await screen.findByRole('button', { name: 'Desativar' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Desativar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao desativar.');
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Desativar' })).toBeEnabled();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Desativar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('Nenhuma especialidade encontrada')).toBeInTheDocument();
    expect(screen.queryByText('Epidemiologia')).not.toBeInTheDocument();
    expect(serviceMocks.listSpecialties).toHaveBeenLastCalledWith({ isActive: true, page: 1, pageSize: 20 });
  });

  it('bloqueia envio durante a mutação e mantém os dados e erros no formulário após falha', async () => {
    let rejectMutation!: (reason: unknown) => void;
    serviceMocks.updateSpecialty.mockReturnValue(new Promise((_resolve, reject) => { rejectMutation = reject; }));
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Editar' }));
    const form = within(screen.getByRole('form', { name: 'Formulário de especialidade' }));
    await user.click(form.getByRole('button', { name: 'Salvar' }));
    expect(form.getByRole('button', { name: 'Salvando…' })).toBeDisabled();
    expect(form.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    act(() => rejectMutation({ message: 'Nome duplicado', fieldErrors: { name: 'Nome já utilizado.' } }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Nome duplicado');
    expect(await form.findByText('Nome já utilizado.')).toBeInTheDocument();
    expect(form.getByLabelText(/Nome/)).toHaveValue('Epidemiologia');
    expect(form.getByRole('button', { name: 'Salvar' })).toBeEnabled();
    expect(serviceMocks.listSpecialties).toHaveBeenCalledTimes(1);
    await user.click(form.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('form', { name: 'Formulário de especialidade' })).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Cadastrar especialidade' }));
    expect(screen.getByLabelText(/Código/)).toHaveValue('');
    expect(screen.queryByText('Nome já utilizado.')).not.toBeInTheDocument();
  });

  it('usa o Skeleton do Listing durante o carregamento', async () => {
    let resolveRequest!: (value: SpecialtyListResponse) => void;
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
    expect(screen.queryByTitle('Open')).not.toBeInTheDocument();
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

    const status = screen.getByRole('radio', { name: 'Inativas' });
    await user.click(status);

    await waitFor(() => expect(serviceMocks.listSpecialties).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      query: 'Epidemiologia',
      isActive: false,
    }));
    expect(store.getState().specialties.list.page).toBe(1);

    expect(await screen.findByRole('radio', { name: 'Inativas' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Ativas' }));
    await waitFor(() => expect(store.getState().specialties.list.filters).toEqual({ query: 'Epidemiologia', isActive: true }));
    await user.click(screen.getByRole('radio', { name: 'Todas' }));

    await waitFor(() => expect(store.getState().specialties.list.filters).toEqual({ query: 'Epidemiologia' }));
    expect(serviceMocks.listSpecialties).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 20,
      query: 'Epidemiologia',
      isActive: undefined,
    });
  });

  it('permite pesquisar um texto que não está entre as opções da página atual', async () => {
    serviceMocks.listSpecialties.mockResolvedValue(listResponse());
    const user = userEvent.setup();

    renderPage();
    await screen.findByText('Epidemiologia');

    const query = screen.getByRole('combobox', { name: 'Buscar especialidade' });
    await user.type(query, 'Cardiologia');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(serviceMocks.listSpecialties).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      query: 'Cardiologia',
      isActive: undefined,
    }));
  });

  it('diferencia os estados vazios e limpa os filtros ativos', async () => {
    serviceMocks.listSpecialties.mockImplementation(async (params) => {
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

    await waitFor(() => expect(store.getState().specialties.list.filters).toEqual({}));
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

    await user.click(screen.getByRole('button', { name: /próxima página/i }));
    await waitFor(() => expect(serviceMocks.listSpecialties).toHaveBeenCalledWith(expect.objectContaining({ page: 2 })));
    expect(await screen.findByText(/21.*40 de 45/)).toBeInTheDocument();

    const rowsPerPage = screen.getByRole('combobox', { name: /linhas por página/i });
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
    expect(screen.queryByText('Nenhuma especialidade encontrada')).not.toBeInTheDocument();
    expect(screen.queryByText('Não encontramos especialidades com os filtros selecionados.')).not.toBeInTheDocument();
    expect(serviceMocks.listSpecialties).toHaveBeenNthCalledWith(1, {
      page: 2,
      pageSize: 20,
      query: 'epi',
      isActive: true,
    });

    serviceMocks.listSpecialties.mockResolvedValueOnce(listResponse([buildSpecialty()], {
      page: 2,
      pageSize: 20,
      totalItems: 21,
      totalPages: 2,
    }));
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Epidemiologia')).toBeInTheDocument();
  });
});
