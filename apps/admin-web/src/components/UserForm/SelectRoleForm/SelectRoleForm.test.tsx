import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RoleFormFields } from '../../../types/user.types';
import { SelectRoleForm } from './SelectRoleForm';

vi.mock('@niar/ui', () => ({
  Select: ({ label, value, options, onChange, onBlur }: any) => (
    <label>
      {label}
      <select aria-label={label} value={value} onChange={onChange} onBlur={onBlur}>
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  ),
}));

describe('SelectRoleForm', () => {
  afterEach(cleanup);

  it('retorna a role selecionada sem acessar estado ou API', async () => {
    const onChange = vi.fn();
    const onBlur = vi.fn();
    const fields: RoleFormFields = {
      role: {
        name: 'role',
        value: 'admin',
        options: [
          { value: 'admin', label: 'Administrador' },
          { value: 'auditor', label: 'Auditor' },
        ],
        onChange,
        onBlur,
      },
    };

    render(
      <SelectRoleForm fields={fields} />,
    );

    expect(screen.getByLabelText('Tipo de usuário')).toHaveValue('admin');

    await userEvent.selectOptions(screen.getByLabelText('Tipo de usuário'), 'auditor');
    expect(onChange).toHaveBeenCalledWith('auditor');

    fireEvent.blur(screen.getByLabelText('Tipo de usuário'));
    expect(onBlur).toHaveBeenCalledOnce();
  });
});
