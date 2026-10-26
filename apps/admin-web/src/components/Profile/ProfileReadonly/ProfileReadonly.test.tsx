import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ListText, StatusChip } from '@niar/ui';
import { ProfileReadonly } from './ProfileReadonly';

describe('ProfileReadonly', () => {
  afterEach(cleanup);

  it('renderiza o título e os filhos recebidos', () => {
    render(
      <ProfileReadonly title="Acesso à plataforma">
        <ListText items={[{ label: 'Perfil de acesso', value: 'Gestor' }]} />
      </ProfileReadonly>,
    );

    expect(
      screen.getByRole('heading', { name: 'Acesso à plataforma', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Perfil de acesso')).toBeInTheDocument();
    expect(screen.getByText('Gestor')).toBeInTheDocument();
  });

  it('aceita qualquer composição readonly, inclusive StatusChip', () => {
    render(
      <ProfileReadonly title="Status">
        <ListText items={[{ label: 'Perfil de acesso', value: 'Gestor' }]} />
        <StatusChip aria-label="Status da conta" label="Ativo" status="success" />
      </ProfileReadonly>,
    );

    expect(screen.getByLabelText('Status da conta')).toHaveTextContent('Ativo');
  });

  it('não transforma os dados recebidos em campos editáveis', () => {
    render(
      <ProfileReadonly title="Dados institucionais">
        <ListText items={[{ label: 'Instituição', value: 'UFMG' }]} />
      </ProfileReadonly>,
    );

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
