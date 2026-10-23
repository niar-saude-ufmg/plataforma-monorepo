import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmationDialog } from './ConfirmationDialog';

vi.mock('@niar/ui', () => ({
  Button: ({ color, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { color?: string }) => (
    <button data-color={color} {...props} />
  ),
  Dialog: ({ open, title, children, actions }: {
    open: boolean;
    title: React.ReactNode;
    children: React.ReactNode;
    actions: React.ReactNode;
  }) => open ? (
    <div role="dialog" aria-label={String(title)}>
      <h2>{title}</h2>
      {children}
      {actions}
    </div>
  ) : null,
}));

describe('ConfirmationDialog', () => {
  it('exibe a confirmação e dispara a ação escolhida', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmationDialog
        open
        title="Desativar especialidade"
        onClose={onClose}
        onConfirm={onConfirm}
        confirmLabel="Desativar"
      >
        Deseja desativar a especialidade?
      </ConfirmationDialog>,
    );

    expect(screen.getByRole('dialog', { name: 'Desativar especialidade' })).toHaveTextContent(
      'Deseja desativar a especialidade?',
    );
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(screen.getByRole('button', { name: 'Desativar' }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('usa a cor de perigo quando a confirmação é destrutiva', () => {
    render(
      <ConfirmationDialog
        open
        title="Confirmar"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        confirmLabel="Excluir"
        type="danger"
      >
        Conteúdo
      </ConfirmationDialog>,
    );

    expect(screen.getByRole('button', { name: 'Excluir' })).toHaveAttribute('data-color', 'danger');
  });
});
