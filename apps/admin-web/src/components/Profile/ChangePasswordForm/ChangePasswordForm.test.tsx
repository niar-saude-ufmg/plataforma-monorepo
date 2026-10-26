import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { UserTextField } from '../../../types/user.types';
import { ChangePasswordForm } from './ChangePasswordForm';

const fields = {
  currentPassword: {
    name: 'currentPassword',
    value: '',
    onChange: vi.fn(),
    onBlur: vi.fn(),
  } satisfies UserTextField,
  password: {
    name: 'password',
    value: '',
    onChange: vi.fn(),
    onBlur: vi.fn(),
  } satisfies UserTextField,
  passwordConfirmation: {
    name: 'passwordConfirmation',
    value: '',
    onChange: vi.fn(),
    onBlur: vi.fn(),
  } satisfies UserTextField,
};

describe('ChangePasswordForm', () => {
  afterEach(cleanup);

  it('renderiza os campos recebidos pelo hook', () => {
    render(
      <ChangePasswordForm
        fields={fields}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Trocar senha', level: 2 })).toBeInTheDocument();
    expect(screen.getByLabelText('Senha atual')).toBeInTheDocument();
    expect(screen.getByLabelText('Nova senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Repetir senha')).toBeInTheDocument();
  });

  it('chama os callbacks dos botões sem assumir regras de negócio', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <ChangePasswordForm
        fields={fields}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('desabilita campos e ações durante o envio', () => {
    render(
      <ChangePasswordForm
        fields={fields}
        submitting
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Senha atual')).toBeDisabled();
    expect(screen.getByLabelText('Nova senha')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Trocar senha' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
