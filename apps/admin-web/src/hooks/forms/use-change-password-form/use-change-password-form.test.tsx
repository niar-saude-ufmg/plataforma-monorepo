import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useChangePasswordForm } from './use-change-password-form';

function PasswordFormHarness({ onSubmit }: { onSubmit: (values: unknown) => void }) {
  const form = useChangePasswordForm();

  return (
    <>
      <input aria-label="Senha atual" {...form.fields.currentPassword} />
      <input aria-label="Nova senha" {...form.fields.password} />
      <input aria-label="Repetir senha" {...form.fields.passwordConfirmation} />
      <button onClick={() => void form.handleSubmit(onSubmit)()}>Salvar</button>
    </>
  );
}

describe('useChangePasswordForm', () => {
  afterEach(cleanup);

  it('inicia os campos vazios', () => {
    render(<PasswordFormHarness onSubmit={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: 'Senha atual' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Nova senha' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Repetir senha' })).toHaveValue('');
  });

  it('não envia quando a confirmação não confere', async () => {
    const onSubmit = vi.fn();
    render(<PasswordFormHarness onSubmit={onSubmit} />);
    const formUser = userEvent.setup();

    await formUser.type(screen.getByRole('textbox', { name: 'Senha atual' }), 'senha-atual');
    await formUser.type(screen.getByRole('textbox', { name: 'Nova senha' }), 'nova-senha-123');
    await formUser.type(screen.getByRole('textbox', { name: 'Repetir senha' }), 'outra-senha-123');
    await formUser.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
