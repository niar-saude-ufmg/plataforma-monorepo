import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UserDetailsDialog } from './UserDetailsDialog';
import { USER_DETAILS_CONFIG } from '../../pages/Users/Users.roles';
import type { UserListItem, UserRole } from '../../types/user.types';

const user: UserListItem = {
  id: 1, fullName: 'Ana Silva', email: 'ana@example.org', role: 'researcher',
  createdAt: '2026-01-01T00:00:00Z', accountStatus: 'active',
  profile: { phone: '31999998888', institution: 'UFMG', organizationalUnit: 'Saúde', contactAddress: 'Belo Horizonte' },
  researcherProfile: { researchArea: 'Epidemiologia', position: 'Professora' },
  committeeProfile: { specialty: { id: 1, code: 'SAU', name: 'Saúde pública' } },
  coep: { caae: '123', opinionNumber: '456', approvalDate: '2026-10-01', documentFilename: 'parecer.pdf' },
  latestAuthEvaluation: null,
};

afterEach(cleanup);

describe('UserDetailsDialog', () => {
  it.each(['admin', 'researcher', 'committee'] as const)('renderiza a configuração de %s', (role: UserRole) => {
    const config = USER_DETAILS_CONFIG[role]!;
    render(<UserDetailsDialog open user={{ ...user, role }} config={config} onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Detalhes de Ana Silva')).toBeInTheDocument();
    for (const section of config.sections) {
      if (section.title) {
        expect(within(dialog).getByRole('heading', { name: section.title })).toBeInTheDocument();
      }
      for (const item of section.items) {
        expect(within(dialog).getByText(item.label)).toBeInTheDocument();
      }
    }
    expect(within(dialog).getByText(user.fullName)).toBeInTheDocument();
    const expectedLabels = ['Nome completo', 'E-mail', 'Perfil e status'];
    if (role === 'researcher') expectedLabels.push('CAAE', 'Número do parecer', 'Data de aprovação');
    if (role === 'committee') expectedLabels.push('Especialidade');
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(expectedLabels.length);
    for (const label of expectedLabels) {
      expect(within(dialog).getByText(label)).toBeInTheDocument();
    }
    if (role === 'admin') {
      expect(within(dialog).queryByRole('heading', { name: 'Dados da conta' })).not.toBeInTheDocument();
    }
    if (role === 'committee') {
      expect(within(dialog).getByText('Comitê gestor · Ativo')).toBeInTheDocument();
      expect(within(dialog).getByText('Saúde pública')).toBeInTheDocument();
    }
  });

  it('formata valores na configuração e atualiza o usuário recebido', () => {
    const props = { open: true, user, config: USER_DETAILS_CONFIG.researcher, onClose: vi.fn() };
    const view = render(<UserDetailsDialog {...props} />);
    expect(screen.getByText('01/10/2026')).toBeInTheDocument();
    expect(screen.getByText('Pesquisador · Ativo')).toBeInTheDocument();
    view.rerender(<UserDetailsDialog {...props} user={{ ...user, fullName: 'Outro usuário', profile: null, coep: null }} />);
    expect(screen.queryByText('Ana Silva')).not.toBeInTheDocument();
    expect(screen.getByText('Outro usuário')).toBeInTheDocument();
    expect(screen.getByText('Detalhes de Outro usuário')).toBeInTheDocument();
    expect(screen.getAllByText('Não informado').length).toBeGreaterThan(0);
  });

  it('aceita título estático e descrição sem regras de perfil', () => {
    render(
      <UserDetailsDialog
        open
        user={user}
        config={{ title: 'Consulta', description: 'Dados disponíveis', sections: [] }}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Consulta')).toBeInTheDocument();
    expect(screen.getByText('Dados disponíveis')).toBeInTheDocument();
  });

  it('delega o fechamento ao callback', () => {
    const onClose = vi.fn();
    render(<UserDetailsDialog open user={user} config={USER_DETAILS_CONFIG.admin} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledOnce();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', keyCode: 27 });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('não abre sem usuário, configuração ou quando fechado', () => {
    const props = { open: true, user, config: USER_DETAILS_CONFIG.admin, onClose: vi.fn() };
    const view = render(<UserDetailsDialog {...props} user={null} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    view.rerender(<UserDetailsDialog {...props} config={undefined} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    view.rerender(<UserDetailsDialog {...props} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
