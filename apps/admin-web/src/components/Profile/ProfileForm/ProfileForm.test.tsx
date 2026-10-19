import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
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

  it('não exibe botão de salvar, cancelar ou editar nesta entrega', () => {
    render(<ProfileForm role="researcher" user={researcher} mode="readonly" />);

    expect(screen.queryByRole('button', { name: /salvar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancelar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
  });

  it('não expõe campos de senha', () => {
    render(<ProfileForm role="researcher" user={researcher} mode="readonly" />);

    expect(screen.queryByLabelText(/senha/i)).not.toBeInTheDocument();
  });
});
