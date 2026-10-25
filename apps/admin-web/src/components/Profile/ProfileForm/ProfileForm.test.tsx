import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProfileForm } from './ProfileForm';
import type { AuthUser } from '../../../types/user.types';

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
  accountStatus: 'active',
  profile: {
    phone: '(31) 99999-0000',
    institution: 'UFMG',
    organizationalUnit: 'Faculdade de Medicina',
    contactAddress: 'Belo Horizonte - MG',
  },
};

describe('ProfileForm', () => {
  afterEach(cleanup);

  it('mostra nome e e-mail preenchidos para o Administrador', () => {
    render(<ProfileForm role="admin" user={admin} mode="readonly" />);

    expect(screen.getByLabelText('Nome completo')).toHaveValue('Gestora Um');
    expect(screen.getByLabelText('E-mail')).toHaveValue('gestora@niar.local');
  });

  it('não renderiza Telefone para o Administrador', () => {
    render(<ProfileForm role="admin" user={admin} mode="readonly" />);

    expect(screen.queryByLabelText('Telefone')).not.toBeInTheDocument();
  });

  it('renderiza Telefone preenchido para o Pesquisador', () => {
    render(<ProfileForm role="researcher" user={researcher} mode="readonly" />);

    expect(screen.getByLabelText('Nome completo')).toHaveValue('Pesquisadora Dois');
    expect(screen.getByLabelText('E-mail')).toHaveValue('pesquisadora@niar.local');
    expect(screen.getByLabelText('Telefone')).toHaveValue('(31) 99999-0000');
  });

  it('deixa os campos não editáveis em mode="readonly"', () => {
    render(<ProfileForm role="researcher" user={researcher} mode="readonly" />);

    for (const label of ['Nome completo', 'E-mail', 'Telefone']) {
      expect(screen.getByLabelText(label)).toBeDisabled();
    }
  });

  it('libera a edição em mode="edit" mantendo os valores', () => {
    render(<ProfileForm role="researcher" user={researcher} mode="edit" />);

    expect(screen.getByLabelText('Nome completo')).toBeEnabled();
    expect(screen.getByLabelText('Nome completo')).toHaveValue('Pesquisadora Dois');
    expect(screen.getByLabelText('Telefone')).toHaveValue('(31) 99999-0000');
  });

  it('usa valor vazio quando o Pesquisador não tem telefone', () => {
    render(
      <ProfileForm
        role="researcher"
        user={{ ...researcher, profile: undefined }}
        mode="readonly"
      />,
    );

    expect(screen.getByLabelText('Telefone')).toHaveValue('');
  });

  it('não exibe Salvar nem Cancelar em modo readonly', () => {
    render(<ProfileForm role="researcher" user={researcher} mode="readonly" />);

    expect(screen.queryByRole('button', { name: /salvar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancelar/i })).not.toBeInTheDocument();
  });

  it('não expõe campos de senha', () => {
    render(<ProfileForm role="researcher" user={researcher} mode="readonly" />);

    expect(screen.queryByLabelText(/senha/i)).not.toBeInTheDocument();
  });
});

describe('ProfileForm — edição', () => {
  afterEach(cleanup);

  it('mostra Salvar e Cancelar em mode="edit"', () => {
    render(<ProfileForm role="admin" user={admin} mode="edit" />);

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('renderiza as ações do cabeçalho só em readonly', () => {
    const { rerender } = render(
      <ProfileForm role="admin" user={admin} mode="readonly" actions={<button>Editar perfil</button>} />,
    );
    expect(screen.getByRole('button', { name: 'Editar perfil' })).toBeInTheDocument();

    rerender(
      <ProfileForm role="admin" user={admin} mode="edit" actions={<button>Editar perfil</button>} />,
    );
    expect(screen.queryByRole('button', { name: 'Editar perfil' })).not.toBeInTheDocument();
  });

  it('envia os valores editados', async () => {
    const onSubmit = vi.fn();
    render(
      <ProfileForm
        role="admin"
        user={admin}
        mode="edit"
        editableFields={['fullName', 'email']}
        onSubmit={onSubmit}
      />,
    );

    const nome = screen.getByLabelText('Nome completo');
    await userEvent.clear(nome);
    await userEvent.type(nome, 'Gestora Atualizada');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      fullName: 'Gestora Atualizada',
      email: 'gestora@niar.local',
    });
  });

  it('não envia telefone para quem não pode editá-lo', async () => {
    const onSubmit = vi.fn();
    render(
      <ProfileForm
        role="admin"
        user={admin}
        mode="edit"
        editableFields={['fullName', 'email']}
        onSubmit={onSubmit}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('phone');
  });

  it('envia telefone para o Pesquisador', async () => {
    const onSubmit = vi.fn();
    render(
      <ProfileForm
        role="researcher"
        user={researcher}
        mode="edit"
        editableFields={['fullName', 'email', 'phone']}
        onSubmit={onSubmit}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].phone).toBe('(31) 99999-0000');
  });

  it('cancelar restaura os valores originais e avisa a página', async () => {
    const onCancel = vi.fn();
    render(<ProfileForm role="admin" user={admin} mode="edit" onCancel={onCancel} />);

    const nome = screen.getByLabelText('Nome completo');
    await userEvent.clear(nome);
    await userEvent.type(nome, 'Rascunho');
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.getByLabelText('Nome completo')).toHaveValue('Gestora Um'));
  });

  it('valida e-mail inválido sem chamar o submit', async () => {
    const onSubmit = vi.fn();
    render(<ProfileForm role="admin" user={admin} mode="edit" onSubmit={onSubmit} />);

    const email = screen.getByLabelText('E-mail');
    await userEvent.clear(email);
    await userEvent.type(email, 'sem-arroba');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(screen.getByText('Informe um e-mail válido, como nome@instituicao.org.')).toBeInTheDocument(),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('bloqueia os campos e os botões durante o envio', () => {
    render(<ProfileForm role="admin" user={admin} mode="edit" submitting />);

    expect(screen.getByLabelText('Nome completo')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
