import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FixedDialog } from './FixedDialog';

vi.mock('@niar/ui', () => ({
  Dialog: ({ open, title, children, actions, showCloseButton, closeOnBackdropClick, disableEscapeKeyDown }: any) =>
    open ? (
      <div
        role="dialog"
        aria-label={String(title)}
        data-show-close={showCloseButton}
        data-close-backdrop={closeOnBackdropClick}
        data-disable-escape={disableEscapeKeyDown}
      >
        <h2>{title}</h2>
        {children}
        <div data-testid="fixed-dialog-actions">{actions}</div>
      </div>
    ) : null,
}));

describe('FixedDialog', () => {
  it('renderiza o conteúdo e as ações quando open é true', () => {
    render(
      <FixedDialog
        open
        title="Teste"
        onClose={vi.fn()}
        actions={<button>Ação</button>}
      >
        Conteúdo interno
      </FixedDialog>,
    );

    expect(screen.getByRole('dialog', { name: 'Teste' })).toBeInTheDocument();
    expect(screen.getByText('Conteúdo interno')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ação' })).toBeInTheDocument();
  });

  it('não renderiza nada quando open é false', () => {
    render(
      <FixedDialog
        open={false}
        title="Teste"
        onClose={vi.fn()}
        actions={<button>Ação</button>}
      >
        Conteúdo interno
      </FixedDialog>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('força o fechamento controlado (sem X, sem overlay, sem Escape)', () => {
    render(
      <FixedDialog
        open
        title="Teste"
        onClose={vi.fn()}
        actions={<button>Ação</button>}
      >
        Conteúdo
      </FixedDialog>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-show-close', 'false');
    expect(dialog).toHaveAttribute('data-close-backdrop', 'false');
    expect(dialog).toHaveAttribute('data-disable-escape', 'true');
  });
});
