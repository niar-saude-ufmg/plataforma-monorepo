import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { userSchema } from '../../../pages/User/User.validators';
import { useSharedUserForm } from '../use-shared-user-form/use-shared-user-form';
import { useCommitteeForm } from './use-committee-form';

function CommitteeFormHarness() {
  const { control } = useSharedUserForm({ schema: userSchema });
  const { fields } = useCommitteeForm(control);

  return (
    <>
      <output data-testid="field-count">{Object.keys(fields).length}</output>
      <input
        aria-label="Especialidade"
        {...fields.specialtyId.field}
        value={fields.specialtyId.field.value?.value ?? ''}
      />
    </>
  );
}

describe('useCommitteeForm', () => {
  afterEach(cleanup);

  it('cria o controller específico do comitê', () => {
    render(<CommitteeFormHarness />);

    expect(screen.getByTestId('field-count')).toHaveTextContent('1');
    expect(screen.getByLabelText('Especialidade')).toHaveValue('');
  });
});
