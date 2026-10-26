import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../App';
import { Profile } from './Profile';
import { store } from '../../store';
import { clearAuthMutation, setSelectedAuthUser } from '../../store/auth/auth.slice';
import { clearUsersError } from '../../store/users/users.slice';
import type { AuthUser } from '../../types/user.types';
import type { ProfileRole } from '../../types/role-profile';

const admin: AuthUser = {
  id: 1,
  name: 'Gestora Um',
  email: 'gestora@niar.local',
  role: 'admin',
  accountStatus: 'active',
};

const researcher: AuthUser = {
  id: 2,
  name: 'Pesquisadora Dois',
  email: 'pesquisadora@niar.local',
  role: 'researcher',
  accountStatus: 'pending',
  profile: {
    phone: '(31) 99999-0000',
    institution: 'UFMG',
    organizationalUnit: 'Faculdade de Medicina',
    contactAddress: 'Belo Horizonte - MG',
  },
  researcherProfile: {
    researchArea: 'Saúde pública',
    position: 'Professora adjunta',
  },
  coep: {
    caae: '12345678.9.0000.0000',
    opinionNumber: '1234.567',
    approvalDate: '2026-09-25',
    documentFilename: 'parecer-coep.pdf',
  },
};

// Renderiza a página direto, com o usuário já no authSlice.
function renderPage(user: AuthUser | null, props: Partial<{ sessionError: unknown }> = {}) {
  store.dispatch(setSelectedAuthUser(user));
  const role: ProfileRole = user?.role === 'researcher' ? 'researcher' : 'admin';

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin/administrador/perfil']}>
        <Profile role={role} {...props} />
      </MemoryRouter>
    </Provider>,
  );
}

describe('rotas de Perfil', () => {
  afterEach(() => {
    cleanup();
    store.dispatch(setSelectedAuthUser(null));
  });

  it('abre /admin/administrador/perfil para o Administrador', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/administrador/perfil']}>
        <App mode="admin" currentUser={admin} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Perfil', level: 1 })).toBeInTheDocument();
  });

  it('abre /admin/pesquisador/perfil para o Pesquisador', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/pesquisador/perfil']}>
        <App mode="admin" currentUser={researcher} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Perfil', level: 1 })).toBeInTheDocument();
  });

  it('renderiza a mesma página nos dois papéis', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/administrador/perfil']}>
        <App mode="admin" currentUser={admin} />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Dados da conta', level: 2 })).toBeInTheDocument();
    cleanup();

    render(
      <MemoryRouter initialEntries={['/admin/pesquisador/perfil']}>
        <App mode="admin" currentUser={researcher} />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Dados da conta', level: 2 })).toBeInTheDocument();
  });

  it('não oferece rota de Perfil para o Comitê', async () => {
    const committee: AuthUser = {
      id: 3,
      name: 'Comitê Três',
      email: 'comite@niar.local',
      role: 'committee',
      accountStatus: 'active',
    };

    render(
      <MemoryRouter initialEntries={['/admin/comite/perfil']}>
        <App mode="admin" currentUser={committee} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Boas vindas, Comitê Três.' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Perfil', level: 1 })).not.toBeInTheDocument();
  });

  it('não leva o Administrador para a rota de Perfil do Pesquisador', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/pesquisador/perfil']}>
        <App mode="admin" currentUser={admin} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Boas vindas, Gestora Um.' })).toBeInTheDocument();
  });

  it('mostra Perfil no menu apenas de Administrador e Pesquisador', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/administrador/home']}>
        <App mode="admin" currentUser={admin} />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('tab', { name: 'Perfil' })).toBeInTheDocument();
    cleanup();

    const committee: AuthUser = {
      id: 3,
      name: 'Comitê Três',
      email: 'comite@niar.local',
      role: 'committee',
      accountStatus: 'active',
    };

    render(
      <MemoryRouter initialEntries={['/admin/comite/home']}>
        <App mode="admin" currentUser={committee} />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Boas vindas, Comitê Três.' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Perfil' })).not.toBeInTheDocument();
  });
});

describe('página de Perfil', () => {
  afterEach(() => {
    cleanup();
    store.dispatch(setSelectedAuthUser(null));
  });

  it('usa o usuário do authSlice para preencher o formulário', () => {
    renderPage(admin);

    expect(screen.getByRole('textbox', { name: 'Nome completo' })).toHaveValue('Gestora Um');
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveValue('gestora@niar.local');
  });

  it('renderiza o ProfileForm em modo readonly', () => {
    renderPage(admin);

    expect(screen.getByRole('textbox', { name: 'Nome completo' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toBeDisabled();
  });

  it('exibe perfil de acesso e status da conta para o Administrador', () => {
    renderPage(admin);

    expect(screen.getByRole('heading', { name: 'Acesso à plataforma', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Perfil de acesso')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByLabelText('Status da conta')).toHaveTextContent('Ativo');
  });

  it('não exibe telefone, dados institucionais nem COEP para o Administrador', () => {
    renderPage(admin);

    expect(screen.queryByRole('textbox', { name: 'Telefone' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Dados acadêmicos e institucionais' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Dados de avaliação no COEP' }),
    ).not.toBeInTheDocument();
  });

  it('não exibe Acesso à plataforma para o Pesquisador', () => {
    renderPage(researcher);

    expect(screen.queryByRole('heading', { name: 'Acesso à plataforma' })).not.toBeInTheDocument();
    expect(screen.queryByText('Perfil de acesso')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Status da conta')).not.toBeInTheDocument();
  });

  it('usa a descrição da página prevista para cada papel', () => {
    renderPage(admin);
    expect(
      screen.getByText('Gerencie seus dados pessoais e as permissões de acesso à plataforma.'),
    ).toBeInTheDocument();
    cleanup();

    renderPage(researcher);
    expect(
      screen.getByText('Gerencie seus dados pessoais, acadêmicos e informações do COEP.'),
    ).toBeInTheDocument();
  });

  it('exibe contato, instituição, dados acadêmicos e COEP para o Pesquisador', () => {
    renderPage(researcher);

    expect(screen.getByRole('textbox', { name: 'Telefone' })).toHaveValue('(31) 99999-0000');

    expect(
      screen.getByRole('heading', { name: 'Dados acadêmicos e institucionais', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText('UFMG')).toBeInTheDocument();
    expect(screen.getByText('Faculdade de Medicina')).toBeInTheDocument();
    expect(screen.getByText('Belo Horizonte - MG')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Dados de avaliação no COEP', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Saúde pública')).toBeInTheDocument();
    expect(screen.getByText('Professora adjunta')).toBeInTheDocument();
    expect(screen.getByText('1234.567')).toBeInTheDocument();
    expect(screen.getByText('12345678.9.0000.0000')).toBeInTheDocument();
    expect(screen.getByText('parecer-coep.pdf')).toBeInTheDocument();
  });

  it('formata a data de aprovação do COEP como DD/MM/AAAA', () => {
    renderPage(researcher);

    expect(screen.getByText('25/09/2026')).toBeInTheDocument();
  });

  it('traduz o status da conta para o StatusChip oficial', () => {
    renderPage({ ...admin, accountStatus: 'pending' });

    expect(screen.getByLabelText('Status da conta')).toHaveTextContent('Pendente');
  });

  it('mostra "Não informado" quando o dado não editável está vazio', () => {
    renderPage({ ...researcher, researcherProfile: { researchArea: null, position: null } });

    expect(screen.getAllByText('Não informado').length).toBeGreaterThan(0);
  });

  it('mostra carregamento enquanto a sessão não chega', () => {
    renderPage(null);

    expect(screen.getByLabelText('Carregando perfil')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Nome completo' })).not.toBeInTheDocument();
  });

  it('mostra o erro de carregamento no Snackbar oficial', () => {
    renderPage(admin, { sessionError: { message: 'Falha ao carregar o perfil.' } });

    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao carregar o perfil.');
  });

  it('mantém o Snackbar fechado sem erro', () => {
    renderPage(admin);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('não mostra os formulários de edição antes de a ação ser usada', () => {
    renderPage(researcher);

    expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Senha atual' })).not.toBeInTheDocument();
  });
});

const fetchMock = vi.hoisted(() => {
  const mock = vi.fn();
  globalThis.fetch = mock as typeof fetch;
  return mock;
});

const sessionResponse = {
  id: 1,
  email: 'gestora@niar.local',
  full_name: 'Gestora Atualizada',
  role: 'admin' as const,
  account_status: 'active' as const,
};

describe('Perfil — edição, senha e download', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    store.dispatch(clearAuthMutation());
    store.dispatch(clearUsersError());
    store.dispatch(setSelectedAuthUser(null));
  });

  it('mostra as ações permitidas pelo papel', () => {
    renderPage(admin);

    expect(screen.getByRole('button', { name: 'Editar perfil' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trocar senha' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Baixar' })).not.toBeInTheDocument();
  });

  it('oferece o download do COEP só para o Pesquisador com documento', () => {
    renderPage(researcher);

    expect(screen.getByRole('button', { name: 'Baixar' })).toBeInTheDocument();
  });

  it('esconde o download quando não há documento do COEP', () => {
    renderPage({ ...researcher, coep: undefined });

    expect(screen.queryByRole('button', { name: 'Baixar' })).not.toBeInTheDocument();
  });

  it('entra em modo de edição e troca o título da página', async () => {
    renderPage(admin);

    await userEvent.click(screen.getByRole('button', { name: 'Editar perfil' }));

    expect(screen.getByRole('heading', { name: 'Editar perfil', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Nome completo' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
  });

  it('cancelar volta para readonly sem tocar no authSlice', async () => {
    renderPage(admin);
    const antes = store.getState().auth.selected;

    await userEvent.click(screen.getByRole('button', { name: 'Editar perfil' }));
    const nome = screen.getByRole('textbox', { name: 'Nome completo' });
    await userEvent.clear(nome);
    await userEvent.type(nome, 'Rascunho');
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Nome completo' })).toBeDisabled());
    expect(store.getState().auth.selected).toEqual(antes);
  });

  it('salvar dispara o PATCH e atualiza a sessão', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => sessionResponse });
    renderPage(admin);

    await userEvent.click(screen.getByRole('button', { name: 'Editar perfil' }));
    const nome = screen.getByRole('textbox', { name: 'Nome completo' });
    await userEvent.clear(nome);
    await userEvent.type(nome, 'Gestora Atualizada');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/auth/me');
    expect(init.method).toBe('PATCH');
    await waitFor(() => expect(store.getState().auth.selected?.name).toBe('Gestora Atualizada'));
  });

  it('abre o formulário de troca de senha e envia sem a confirmação', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => sessionResponse });
    renderPage(admin);

    await userEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));
    await userEvent.type(screen.getByLabelText('Senha atual'), 'senha-atual');
    await userEvent.type(screen.getByLabelText('Nova senha'), 'nova-senha-123');
    await userEvent.type(screen.getByLabelText('Repetir senha'), 'nova-senha-123');
    await userEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(Object.keys(body).sort()).toEqual(['current_password', 'password']);
  });

  it('mostra o erro da API no Snackbar', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: 'E-mail já utilizado por outro usuário' }),
    });
    renderPage(admin);

    await userEvent.click(screen.getByRole('button', { name: 'Editar perfil' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Este e-mail já está em uso por outro usuário.'),
    );
  });

  it('dispara o download autenticado do COEP pelo thunk', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'attachment; filename="parecer-coep.pdf"' },
      blob: async () => new Blob(['pdf']),
    });
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:url');
    globalThis.URL.revokeObjectURL = vi.fn();

    renderPage(researcher);
    await userEvent.click(screen.getByRole('button', { name: 'Baixar' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(String(fetchMock.mock.calls[0][0])).toContain('/users/2/coep-document');
    await waitFor(() => expect(store.getState().users.download.status).toBe('succeeded'));
  });

  it('mostra o erro do download no Snackbar', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Acesso negado' }),
    });

    renderPage(researcher);
    await userEvent.click(screen.getByRole('button', { name: 'Baixar' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Você não tem acesso a este documento.'),
    );
  });

  it('mantém a senha mascarada e não expõe token nem documento no HTML', async () => {
    renderPage(admin);
    await userEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));
    await userEvent.type(screen.getByLabelText('Senha atual'), 'senha-secreta');

    // O campo é controlado: o valor fica no input mascarado, nunca como texto da página.
    expect(screen.getByLabelText('Senha atual')).toHaveAttribute('type', 'password');
    expect(document.body.textContent).not.toContain('senha-secreta');
    expect(document.body.innerHTML).not.toContain('Bearer');
    expect(document.body.innerHTML).not.toContain('coep-document');
  });
});
