import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CoepUserForm } from './CoepUserForm';

vi.mock('@niar/ui', () => ({
  Input: (props: any) => {
    const { label, fullWidth: _fullWidth, ...inputProps } = props;
    return <label>{label}<input aria-label={label} {...inputProps} /></label>;
  },
  DatePicker: (props: any) => {
    const { label, fullWidth: _fullWidth, ...inputProps } = props;
    return <label>{label}<input aria-label={label} type="date" {...inputProps} /></label>;
  },
  FileUpload: ({ label, onChange }: any) => (
    <input
      aria-label={label}
      type="file"
      onChange={(event) => onChange?.([...((event.target as HTMLInputElement).files ?? [])])}
    />
  ),
}));

const field = (name: string) => ({
  name,
  value: '',
  onChange: vi.fn(),
  onBlur: vi.fn(),
});

describe('CoepUserForm', () => {
  afterEach(cleanup);

  it('renderiza os dados do parecer e propaga o PDF escolhido', () => {
    const onDocumentChange = vi.fn();
    render(
      <CoepUserForm
        fields={{
          caae: field('caae'),
          opinionNumber: field('opinionNumber'),
          approvalDate: field('approvalDate'),
          coepDocument: { onChange: onDocumentChange },
        }}
      />,
    );
    const file = new File(['pdf'], 'parecer.pdf', { type: 'application/pdf' });

    expect(screen.getByRole('heading', { name: 'Parecer do COEP' })).toBeInTheDocument();
    expect(screen.getByLabelText('CAAE')).toBeInTheDocument();
    expect(screen.getByLabelText('Número do parecer')).toBeInTheDocument();
    expect(screen.getByLabelText('Data de aprovação')).toHaveAttribute('type', 'date');

    fireEvent.change(screen.getByLabelText('Selecionar parecer em PDF'), {
      target: { files: [file] },
    });

    expect(onDocumentChange).toHaveBeenCalledWith(file);
  });

  it('exibe o erro do arquivo recebido pela página', () => {
    render(
      <CoepUserForm
        fields={{
          caae: field('caae'),
          opinionNumber: field('opinionNumber'),
          approvalDate: field('approvalDate'),
          coepDocument: { onChange: vi.fn(), error: 'Anexe o parecer do COEP.' },
        }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Anexe o parecer do COEP.');
  });
});
