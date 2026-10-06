import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { usePublicUserForm } from './use-public-user-form';

function PublicUserFormHarness() {
  const { fields } = usePublicUserForm();

  return (
    <>
      <output data-testid="field-count">{Object.keys(fields).length}</output>
      <input aria-label="E-mail" {...fields.email.field} />
      <input aria-label="Nome completo" {...fields.fullName.field} />
    </>
  );
}

describe('usePublicUserForm', () => {
  afterEach(cleanup);

  it('cria os controllers do cadastro público com os valores iniciais', () => {
    render(<PublicUserFormHarness />);

    expect(screen.getByTestId('field-count')).toHaveTextContent('14');
    expect(screen.getByLabelText('E-mail')).toHaveValue('');
    expect(screen.getByLabelText('Nome completo')).toHaveValue('');
  });

  it('atualiza o valor do campo controlado', async () => {
    render(<PublicUserFormHarness />);

    await userEvent.setup().type(screen.getByLabelText('E-mail'), 'ana@ufmg.br');

    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@ufmg.br');
  });
});
