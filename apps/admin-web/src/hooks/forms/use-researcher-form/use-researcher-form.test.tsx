import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { userSchema } from '../../../pages/User/User.validators';
import { useSharedUserForm } from '../use-shared-user-form/use-shared-user-form';
import { useResearcherForm } from './use-researcher-form';

function ResearcherFormHarness() {
  const { control } = useSharedUserForm({ schema: userSchema });
  const { fields } = useResearcherForm(control);

  return (
    <>
      <output data-testid="field-count">{Object.keys(fields).length}</output>
      <input aria-label="Telefone" {...fields.phone.field} />
      <input aria-label="CAAE" {...fields.caae.field} />
    </>
  );
}

describe('useResearcherForm', () => {
  afterEach(cleanup);

  it('cria os controllers específicos do pesquisador', () => {
    render(<ResearcherFormHarness />);

    expect(screen.getByTestId('field-count')).toHaveTextContent('10');
    expect(screen.getByLabelText('Telefone')).toHaveValue('');
    expect(screen.getByLabelText('CAAE')).toHaveValue('');
  });
});
