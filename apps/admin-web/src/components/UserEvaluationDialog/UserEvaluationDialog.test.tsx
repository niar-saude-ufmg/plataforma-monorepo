import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UserEvaluationDialog } from './UserEvaluationDialog';
import type { UserListItem } from '../../types/user.types';

vi.mock('@niar/ui', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
  Dialog: ({ open, title, children, actions }: any) => open ? (
    <div role="dialog" aria-label={String(title)}>
      <h2>{title}</h2>
      {children}
      <div>{actions}</div>
    </div>
  ) : null,
  RadioGroup: ({ label, options, value, onChange }: any) => (
    <div>
      <span>{label}</span>
      {options.map((opt: any) => (
        <label key={opt.value}>
          <input
            type="radio"
            name="decision"
            value={opt.value}
            checked={value === opt.value}
            onChange={(e) => onChange(e)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  ),
  Textarea: ({ label, value, onChange, helperText }: any) => (
    <label>
      {label}
      <textarea value={value} onChange={onChange} />
      {helperText && <span data-testid="helper-text">{helperText}</span>}
    </label>
  ),
}));

const mockUser: UserListItem = {
  id: 1,
  fullName: 'Ana Souza',
  email: 'ana@niar.org',
  role: 'researcher',
  accountStatus: 'pending',
  createdAt: '2026-01-01T00:00:00Z',
  profile: null,
  researcherProfile: null,
  committeeProfile: null,
  latestAuthEvaluation: null,
  coep: {
    caae: '12345678.9.0000.0000',
    opinionNumber: '123/2026',
    approvalDate: '2026-09-15',
    documentFilename: 'parecer.pdf',
  },
};

function renderDialog(props: Partial<React.ComponentProps<typeof UserEvaluationDialog>> = {}) {
  return render(
    <UserEvaluationDialog
      open={true}
      user={mockUser}
      onClose={vi.fn()}
      onSubmit={vi.fn()}
      onDownloadCoep={vi.fn()}
      {...props}
    />
  );
}

describe('UserEvaluationDialog', () => {
  it('renderiza os dados do COEP e formata a data', () => {
    renderDialog();
    expect(screen.getByText('Avaliar cadastro de Ana Souza')).toBeInTheDocument();
    expect(screen.getByText('12345678.9.0000.0000')).toBeInTheDocument();
    expect(screen.getByText('15/09/2026')).toBeInTheDocument(); // Data formatada
  });

  it('dispara onDownloadCoep ao clicar no botão', async () => {
    const onDownloadCoep = vi.fn();
    renderDialog({ onDownloadCoep });

    await userEvent.setup().click(screen.getByRole('button', { name: 'Baixar documento' }));
    expect(onDownloadCoep).toHaveBeenCalledTimes(1);
  });

  it('valida obrigatoriedade da decisão', async () => {
    const onSubmit = vi.fn();
    renderDialog({ onSubmit });

    // Clica em confirmar sem selecionar nada
    await userEvent.setup().click(screen.getByRole('button', { name: 'Salvar avaliação' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Selecione uma decisão.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('valida obrigatoriedade da justificativa ao reprovar', async () => {
    const onSubmit = vi.fn();
    renderDialog({ onSubmit });
    const user = userEvent.setup();

    await user.click(screen.getByLabelText('Reprovar'));
    await user.click(screen.getByRole('button', { name: 'Salvar avaliação' }));

    expect(screen.getByTestId('helper-text')).toHaveTextContent('A justificativa é obrigatória quando o cadastro é reprovado.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envia aprovação com sucesso', async () => {
    const onSubmit = vi.fn();
    renderDialog({ onSubmit });
    const user = userEvent.setup();

    await user.click(screen.getByLabelText('Aprovar'));
    await user.click(screen.getByRole('button', { name: 'Salvar avaliação' }));

    expect(onSubmit).toHaveBeenCalledWith('active', undefined);
  });

  it('envia reprovação com justificativa com sucesso', async () => {
    const onSubmit = vi.fn();
    renderDialog({ onSubmit });
    const user = userEvent.setup();

    await user.click(screen.getByLabelText('Reprovar'));
    await user.type(screen.getByRole('textbox'), 'Documento ilegível.');
    await user.click(screen.getByRole('button', { name: 'Salvar avaliação' }));

    expect(onSubmit).toHaveBeenCalledWith('rejected', 'Documento ilegível.');
  });

  it('desabilita os botões e impede o fechamento durante o loading', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();
    renderDialog({ loading: true, onClose, onSubmit });


    const saveButton = screen.getByRole('button', { name: 'Salvando...' });
    expect(saveButton).toBeDisabled();

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    expect(cancelButton).toBeDisabled();

    await userEvent.setup().click(saveButton);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
