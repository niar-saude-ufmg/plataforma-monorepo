import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RegistrationApprovalDialog } from './RegistrationApprovalDialog';

vi.mock('@niar/ui', () => ({
  Button: (props: any) => <button {...props} />,
  Dialog: ({ open, title, children, actions }: any) => open ? (
    <div role="dialog" aria-label={title}>
      <h2>{title}</h2>
      {children}
      {actions}
    </div>
  ) : null,
}));

describe('RegistrationApprovalDialog', () => {
  afterEach(cleanup);

  it('informa sobre a aprovação e permite fechar a mensagem', async () => {
    const onClose = vi.fn();
    render(<RegistrationApprovalDialog open onClose={onClose} />);

    expect(screen.getByRole('dialog', { name: 'Cadastro enviado' })).toHaveTextContent(
      'As informações serão verificadas pela equipe responsável e o acesso à plataforma depende da aprovação do cadastro.',
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Entendi' }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
