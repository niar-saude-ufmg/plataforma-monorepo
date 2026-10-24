import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { userSchema } from '../../../pages/User/User.validators';
import { useSharedUserForm } from '../use-shared-user-form/use-shared-user-form';
import { useRoleForm } from './use-role-form';

function RoleFormHarness() {
  const form = useSharedUserForm({ schema: userSchema });
  const { fields } = useRoleForm(form.control);

  return (
    <select aria-label="Tipo de usuário" {...fields.role.field}>
      <option value="">Selecione o tipo de usuário</option>
      <option value="researcher">Pesquisador</option>
      <option value="admin">Administrador</option>
      <option value="auditor">Auditor</option>
      <option value="committee">Membro do Comitê</option>
    </select>
  );
}

describe('useRoleForm', () => {
  afterEach(cleanup);

  it('inicia sem role e permite selecionar uma role', async () => {
    render(<RoleFormHarness />);
    const role = screen.getByLabelText('Tipo de usuário');

    expect(role).toHaveValue('');
    await userEvent.setup().selectOptions(role, 'committee');
    expect(role).toHaveValue('committee');
  });
});
