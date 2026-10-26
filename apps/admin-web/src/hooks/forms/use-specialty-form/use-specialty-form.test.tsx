import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { useSpecialtyForm } from './use-specialty-form';

function SpecialtyFormHarness() {
  const { fields } = useSpecialtyForm({ mode: 'create' });

  return (
    <>
      <output data-testid="field-count">{Object.keys(fields).length}</output>
      <input aria-label="Código" {...fields.code.field} />
      <input aria-label="Nome" {...fields.name.field} />
    </>
  );
}

describe('useSpecialtyForm', () => {
  afterEach(cleanup);

  it('cria os controllers da especialidade com os valores iniciais', () => {
    render(<SpecialtyFormHarness />);

    expect(screen.getByTestId('field-count')).toHaveTextContent('4');
    expect(screen.getByLabelText('Código')).toHaveValue('');
    expect(screen.getByLabelText('Nome')).toHaveValue('');
  });

  it('atualiza os campos controlados', async () => {
    render(<SpecialtyFormHarness />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Código'), 'epi');
    await user.type(screen.getByLabelText('Nome'), 'Epidemiologia');

    expect(screen.getByLabelText('Código')).toHaveValue('epi');
    expect(screen.getByLabelText('Nome')).toHaveValue('Epidemiologia');
  });
});
