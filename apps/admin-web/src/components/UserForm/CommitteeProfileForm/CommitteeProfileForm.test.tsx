import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommitteeProfileForm } from './CommitteeProfileForm';

vi.mock('@niar/ui', () => ({
  Select: ({ label, options, value, onChange }: any) => (
    <label>
      {label}
      <select aria-label={label} value={value} onChange={onChange}>
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  ),
}));

describe('CommitteeProfileForm', () => {
  afterEach(cleanup);

  it('renderiza a especialidade como select sem acessar o store', () => {
    render(
      <CommitteeProfileForm
        fields={{
          specialtyId: {
            name: 'specialtyId',
            value: null,
            options: [{ value: '1', label: 'Cardiologia' }],
            onChange: vi.fn(),
            onBlur: vi.fn(),
          },
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Dados da comissão' })).toBeInTheDocument();
    expect(screen.getByLabelText('Especialidade')).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Cardiologia' })).toBeInTheDocument();
  });
});
