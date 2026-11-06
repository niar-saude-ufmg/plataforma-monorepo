import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UserStatusDialog } from './UserStatusDialog';
import type { UserListItem } from '../../../types/user.types';

vi.mock('@niar/ui', () => ({
  Button: ({ children, onClick, color }: any) => (
    <button onClick={onClick} data-color={color}>{children}</button>
  ),
  Dialog: ({ open, title, children, actions }: any) => open ? (
    <div role="dialog" aria-label={String(title)}>
      <h2>{title}</h2>
      {children}
      <div>{actions}</div>
    </div>
  ) : null,
}));

const mockUser: UserListItem = {
  id: 1,
  fullName: 'Ana Souza',
  email: 'ana@niar.org',
  role: 'researcher',
  accountStatus: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  profile: null,
  researcherProfile: null,
  committeeProfile: null,
  latestAuthEvaluation: null,
  coep: null,
};

function renderDialog(props: Partial<React.ComponentProps<typeof UserStatusDialog>> = {}) {
  return render(
    <UserStatusDialog
      open={true}
      user={mockUser}
      action="activate"
      onClose={vi.fn()}
      onConfirm={vi.fn()}
      {...props}
    />
  );
}

describe('UserStatusDialog', () => {
  it('renderiza a confirmação de ativação com botão primário', () => {
    renderDialog({ action: 'activate' });

    expect(screen.getByText('Ativar usuário')).toBeInTheDocument();
    expect(screen.getByText('Deseja ativar o usuário "Ana Souza"?')).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'Ativar' });
    expect(confirmButton).toHaveAttribute('data-color', 'primary');
  });

  it('renderiza a confirmação de desativação com botão de perigo', () => {
    renderDialog({ action: 'deactivate' });

    expect(screen.getByText('Desativar usuário')).toBeInTheDocument();
    expect(screen.getByText('Deseja desativar o usuário "Ana Souza"?')).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'Desativar' });
    expect(confirmButton).toHaveAttribute('data-color', 'danger');
  });

  it('dispara onConfirm e onClose corretamente', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    renderDialog({ onConfirm, onClose });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Ativar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
