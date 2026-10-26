import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { userSchema } from '../../../pages/User/User.validators';
import { useSharedUserForm } from './use-shared-user-form';

function UserFormHarness() {
  const { fields } = useSharedUserForm({ schema: userSchema });

  return (
    <>
      <output data-testid="field-count">{Object.keys(fields).length}</output>
      <input aria-label="E-mail" {...fields.email.field} />
    </>
  );
}

describe('useSharedUserForm', () => {
  afterEach(cleanup);

  it('cria os controllers dos campos compartilhados com os valores iniciais', () => {
    render(<UserFormHarness />);

    expect(screen.getByTestId('field-count')).toHaveTextContent('4');
    expect(screen.getByLabelText('E-mail')).toHaveValue('');
  });

  it('atualiza os valores dos campos controlados', async () => {
    render(<UserFormHarness />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('E-mail'), 'ana@ufmg.br');

    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@ufmg.br');
  });
});
