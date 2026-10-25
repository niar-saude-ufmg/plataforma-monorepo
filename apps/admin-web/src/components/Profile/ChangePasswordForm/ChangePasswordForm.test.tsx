import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChangePasswordForm } from './ChangePasswordForm';

async function preencher(atual: string, nova: string, repetir: string) {
  await userEvent.type(screen.getByLabelText('Senha atual'), atual);
  await userEvent.type(screen.getByLabelText('Nova senha'), nova);
  await userEvent.type(screen.getByLabelText('Repetir senha'), repetir);
}

describe('ChangePasswordForm', () => {
  afterEach(cleanup);

  it('renderiza os três campos de senha', () => {
    render(<ChangePasswordForm />);

    expect(screen.getByRole('heading', { name: 'Trocar senha', level: 2 })).toBeInTheDocument();
    expect(screen.getByLabelText('Senha atual')).toBeInTheDocument();
    expect(screen.getByLabelText('Nova senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Repetir senha')).toBeInTheDocument();
  });

  it('envia apenas senha atual e nova senha', async () => {
    const onSubmit = vi.fn();
    render(<ChangePasswordForm onSubmit={onSubmit} />);

    await preencher('senha-atual', 'nova-senha-123', 'nova-senha-123');
    await userEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({
      currentPassword: 'senha-atual',
      password: 'nova-senha-123',
    });
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('passwordConfirmation');
  });

  it('recusa quando a confirmação não confere', async () => {
    const onSubmit = vi.fn();
    render(<ChangePasswordForm onSubmit={onSubmit} />);

    await preencher('senha-atual', 'nova-senha-123', 'outra-senha-123');
    await userEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));

    await waitFor(() => expect(screen.getByText('As senhas não conferem.')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('exige senha nova com pelo menos 8 caracteres', async () => {
    const onSubmit = vi.fn();
    render(<ChangePasswordForm onSubmit={onSubmit} />);

    await preencher('senha-atual', 'curta', 'curta');
    await userEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));

    await waitFor(() =>
      expect(screen.getByText('A nova senha precisa ter pelo menos 8 caracteres.')).toBeInTheDocument(),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('exige a senha atual', async () => {
    const onSubmit = vi.fn();
    render(<ChangePasswordForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Nova senha'), 'nova-senha-123');
    await userEvent.type(screen.getByLabelText('Repetir senha'), 'nova-senha-123');
    await userEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));

    await waitFor(() => expect(screen.getByText('Informe a senha atual.')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('limpa os campos e avisa a página ao cancelar', async () => {
    const onCancel = vi.fn();
    render(<ChangePasswordForm onCancel={onCancel} />);

    await userEvent.type(screen.getByLabelText('Senha atual'), 'algo');
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.getByLabelText('Senha atual')).toHaveValue(''));
  });

  it('bloqueia campos e botões durante o envio', () => {
    render(<ChangePasswordForm submitting />);

    expect(screen.getByLabelText('Senha atual')).toBeDisabled();
    expect(screen.getByLabelText('Nova senha')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Trocar senha' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
