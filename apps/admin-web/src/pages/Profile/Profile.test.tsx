import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../../App';
import { Profile } from './Profile';
import { store } from '../../store';
import { setSelectedAuthUser } from '../../store/auth/auth.slice';
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

    expect(screen.getByLabelText('Nome completo')).toHaveValue('Gestora Um');
    expect(screen.getByLabelText('E-mail')).toHaveValue('gestora@niar.local');
  });

  it('renderiza o ProfileForm em modo readonly', () => {
    renderPage(admin);

    expect(screen.getByLabelText('Nome completo')).toBeDisabled();
    expect(screen.getByLabelText('E-mail')).toBeDisabled();
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

    expect(screen.queryByLabelText('Telefone')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Dados de contato e instituição' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Dados acadêmicos e COEP' }),
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

    expect(screen.getByLabelText('Telefone')).toHaveValue('(31) 99999-0000');

    expect(
      screen.getByRole('heading', { name: 'Dados de contato e instituição', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText('UFMG')).toBeInTheDocument();
    expect(screen.getByText('Faculdade de Medicina')).toBeInTheDocument();
    expect(screen.getByText('Belo Horizonte - MG')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Dados acadêmicos e COEP', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Saúde pública')).toBeInTheDocument();
    expect(screen.getByText('Professora adjunta')).toBeInTheDocument();
    expect(screen.getByText('1234.567')).toBeInTheDocument();
    expect(screen.getByText('12345678.9.0000.0000')).toBeInTheDocument();
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
    expect(screen.queryByLabelText('Nome completo')).not.toBeInTheDocument();
  });

  it('mostra o erro de carregamento no Snackbar oficial', () => {
    renderPage(admin, { sessionError: { message: 'Falha ao carregar o perfil.' } });

    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao carregar o perfil.');
  });

  it('mantém o Snackbar fechado sem erro', () => {
    renderPage(admin);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('não oferece edição, submit nem troca de senha nesta entrega', () => {
    renderPage(researcher);

    expect(screen.queryByRole('button', { name: /editar|salvar|cancelar/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/senha/i)).not.toBeInTheDocument();
  });
});
