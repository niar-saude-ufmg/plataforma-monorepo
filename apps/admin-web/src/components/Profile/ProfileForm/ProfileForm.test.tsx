import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { UserTextField } from '../../../types/user.types';
import { ProfileForm } from './ProfileForm';

const field = (name: string, value: string): UserTextField => ({
  name,
  value,
  onChange: vi.fn(),
  onBlur: vi.fn(),
});

const adminFields = {
  fullName: field('fullName', 'Gestora Um'),
  email: field('email', 'gestora@niar.local'),
  phone: field('phone', ''),
};

const researcherFields = {
  fullName: field('fullName', 'Pesquisadora Dois'),
  email: field('email', 'pesquisadora@niar.local'),
  phone: field('phone', '(31) 99999-0000'),
};

describe('ProfileForm', () => {
  afterEach(cleanup);

  it('renderiza os dados recebidos pelo hook para um administrador', () => {
    render(
      <ProfileForm
        mode="readonly"
        fields={adminFields}
        showPhone={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Nome completo' })).toHaveValue('Gestora Um');
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveValue('gestora@niar.local');
    expect(screen.queryByRole('textbox', { name: 'Telefone' })).not.toBeInTheDocument();
  });

  it('renderiza o telefone quando a página informa que o papel pode usá-lo', () => {
    render(
      <ProfileForm
        mode="readonly"
        fields={researcherFields}
        showPhone
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Telefone' })).toHaveValue('(31) 99999-0000');
    expect(screen.getByRole('textbox', { name: 'Telefone' })).toBeDisabled();
  });

  it('não marca os campos como obrigatórios em modo readonly', () => {
    render(
      <ProfileForm
        mode="readonly"
        fields={researcherFields}
        showPhone
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Nome completo' })).not.toBeRequired();
    expect(screen.getByRole('textbox', { name: 'E-mail' })).not.toBeRequired();
    expect(screen.getByRole('textbox', { name: 'Telefone' })).not.toBeRequired();
  });

  it('marca os campos editáveis como obrigatórios em modo edit', () => {
    render(
      <ProfileForm
        mode="edit"
        fields={researcherFields}
        showPhone
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Nome completo' })).toBeRequired();
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toBeRequired();
    expect(screen.getByRole('textbox', { name: 'Telefone' })).toBeRequired();
  });

  it('renderiza as ações do cabeçalho somente em modo readonly', () => {
    const { rerender } = render(
      <ProfileForm
        mode="readonly"
        fields={adminFields}
        showPhone={false}
        actions={<button>Editar perfil</button>}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Editar perfil' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument();

    rerender(
      <ProfileForm
        mode="edit"
        fields={adminFields}
        showPhone={false}
        actions={<button>Editar perfil</button>}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Editar perfil' })).not.toBeInTheDocument();
  });

  it('habilita os campos e chama os callbacks em modo edit', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <ProfileForm
        mode="edit"
        fields={researcherFields}
        showPhone
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Nome completo' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('mantém o componente inteiro desabilitado durante o envio', () => {
    render(
      <ProfileForm
        mode="edit"
        fields={adminFields}
        showPhone={false}
        submitting
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Nome completo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
