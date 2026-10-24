import { Select } from '@niar/ui';
import type { RoleFormFields, UserRole } from '../../../types/user.types';
import './SelectRoleForm.scss';

type SelectRoleFormProps = {
  fields: RoleFormFields;
};

export function SelectRoleForm({ fields }: SelectRoleFormProps) {
  const { role } = fields;

  return (
    <div className="select-role-form">
      <Select
        name={role.name}
        label="Tipo de usuário"
        required
        value={role.value}
        options={[
          { value: '', label: 'Selecione o tipo de usuário', disabled: true },
          ...role.options,
        ]}
        onChange={(event) => role.onChange(event.target.value as UserRole | '')}
        onBlur={role.onBlur}
        error={role.error}
        helperText={role.helperText}
        fullWidth
      />
    </div>
  );
}
