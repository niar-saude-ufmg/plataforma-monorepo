import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SharedUserForm } from './SharedUserForm';

vi.mock('@niar/ui', () => ({
  Input: (props: any) => {
    const {
      label,
      fullWidth: _fullWidth,
      showPasswordLabel: _showPasswordLabel,
      hidePasswordLabel: _hidePasswordLabel,
      ...inputProps
    } = props;
    return <label>{label}<input aria-label={label} {...inputProps} /></label>;
  },
}));

const field = (name: string, value = '') => ({
  name,
  value,
  onChange: vi.fn(),
  onBlur: vi.fn(),
});

describe('SharedUserForm', () => {
  afterEach(cleanup);

  it('renderiza os campos de acesso sem assumir lógica do formulário', () => {
    render(
      <SharedUserForm
        fields={{
          fullName: field('fullName', 'Ana Souza'),
          email: field('email', 'ana@ufmg.br'),
          password: field('password'),
          passwordConfirmation: field('passwordConfirmation'),
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Dados de acesso' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toHaveValue('Ana Souza');
    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@ufmg.br');
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('placeholder', 'nome@instituicao.org');
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Repetir senha')).toBeInTheDocument();
  });
});
