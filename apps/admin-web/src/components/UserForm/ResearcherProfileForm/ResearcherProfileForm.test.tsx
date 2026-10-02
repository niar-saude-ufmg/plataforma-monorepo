import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ResearcherProfileForm } from './ResearcherProfileForm';

vi.mock('@niar/ui', () => ({
  Input: (props: any) => {
    const { label, fullWidth: _fullWidth, ...inputProps } = props;
    return <label>{label}<input aria-label={label} {...inputProps} /></label>;
  },
}));

const field = (name: string) => ({
  name,
  value: '',
  onChange: vi.fn(),
  onBlur: vi.fn(),
});

describe('ResearcherProfileForm', () => {
  afterEach(cleanup);

  it('renderiza os campos institucionais e acadêmicos', () => {
    render(
      <ResearcherProfileForm
        fields={{
          phone: field('phone'),
          institution: field('institution'),
          organizationalUnit: field('organizationalUnit'),
          contactAddress: field('contactAddress'),
          researchArea: field('researchArea'),
          position: field('position'),
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Dados institucionais e acadêmicos' })).toBeInTheDocument();
    for (const label of [
      'Telefone',
      'Instituição',
      'Unidade organizacional',
      'Endereço de contato',
      'Área de pesquisa',
      'Cargo ou vínculo',
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });
});
