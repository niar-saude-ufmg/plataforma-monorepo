import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_ROUTES } from '@niar/config';
import { PublicUser } from './PublicUser';
import type { ApiError } from '../../types/user.types';

vi.mock('@niar/ui', () => ({
  Alert: ({ children }: any) => <div role="alert">{children}</div>,
  Button: ({ children, className, component, disabled, href, onClick }: any) => {
    const Element = href || component === 'a' ? 'a' : 'button';
    return <Element className={className} disabled={disabled} href={href} onClick={onClick}>{children}</Element>;
  },
  Card: ({ children }: any) => <section>{children}</section>,
  Dialog: ({ open, title, children, actions }: any) => open ? (
    <div role="dialog" aria-label={title}>
      <h2>{title}</h2>
      {children}
      {actions}
    </div>
  ) : null,
  FileUpload: ({ label, onChange }: any) => (
    <input
      aria-label={label}
      type="file"
      onChange={(event) => onChange?.([...((event.target as HTMLInputElement).files ?? [])])}
    />
  ),
  Form: ({ title, description, children }: any) => (
    <section>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </section>
  ),
  Icon: () => null,
  Link: ({ children, startIcon, endIcon, ...props }: any) => <a {...props}>{startIcon}{children}{endIcon}</a>,
  Input: ({ label, type = 'text', value, name, onChange, onBlur, helperText }: any) => (
    <label>
      {label}
      <input aria-label={label} type={type} value={value} name={name} onChange={onChange} onBlur={onBlur} />
      {helperText ? <span>{helperText}</span> : null}
    </label>
  ),
  DatePicker: ({ label, value, name, onChange, onBlur, helperText }: any) => (
    <label>
      {label}
      <input aria-label={label} type="date" value={value} name={name} onChange={onChange} onBlur={onBlur} />
      {helperText ? <span>{helperText}</span> : null}
    </label>
  ),
  PageIntro: ({ title, description }: any) => <><h1>{title}</h1><p>{description}</p></>,
  StatusChip: ({ label }: any) => <span>{label}</span>,
}));

const useCreateUserMutationMock = vi.fn();
const createUserTrigger = vi.fn();
const locationAssignMock = vi.fn();

vi.mock('../../store/users/users.api', () => ({
  useCreateUserMutation: () => useCreateUserMutationMock(),
}));

function setCreateState(overrides: Record<string, unknown> = {}) {
  useCreateUserMutationMock.mockReturnValue([
    createUserTrigger,
    {
      isLoading: false,
      isError: false,
      error: null,
      reset: vi.fn(),
      ...overrides,
    },
  ]);
}

async function fillForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Nome completo'), 'Ana Beatriz Souza');
  await user.type(screen.getByLabelText('E-mail'), 'ana.souza@niar-saude.org');
  await user.type(screen.getByLabelText('Senha'), 'senhaforte1');
  await user.type(screen.getByLabelText('Repetir senha'), 'senhaforte1');
  await user.type(screen.getByLabelText('Telefone'), '(31) 99999-9999');
  await user.type(screen.getByLabelText('Instituição'), 'UFMG');
  await user.type(screen.getByLabelText('Unidade organizacional'), 'Faculdade de Medicina');
  await user.type(screen.getByLabelText('Endereço de contato'), 'Belo Horizonte - MG');
  await user.type(screen.getByLabelText('Área de pesquisa'), 'Saúde pública');
  await user.type(screen.getByLabelText('Cargo ou vínculo'), 'Professora');
  await user.type(screen.getByLabelText('CAAE'), '12345678.9.0000.0000');
  await user.type(screen.getByLabelText('Número do parecer'), '1234.567');
  await user.type(screen.getByLabelText('Data de aprovação'), '2026-09-25');
  await user.upload(
    screen.getByLabelText('Selecionar parecer em PDF'),
    new File(['pdf'], 'parecer-coep.pdf', { type: 'application/pdf' }),
  );
  await user.click(screen.getByRole('button', { name: 'Cadastrar' }));
}

beforeEach(() => {
  vi.clearAllMocks();
  setCreateState();
  createUserTrigger.mockReturnValue({
    unwrap: vi.fn().mockResolvedValue({
      id: 3,
      fullName: 'Ana Beatriz Souza',
      email: 'ana.souza@niar-saude.org',
      role: 'researcher',
      createdAt: '2026-08-31T12:00:00.000Z',
    }),
  });

  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, assign: locationAssignMock },
  });
});

afterEach(() => {
  cleanup();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: globalThis.location,
  });
});

describe('PublicUser', () => {
  it('exibe o gerenciamento do usuário autenticado', () => {
    render(
      <PublicUser
        currentUser={{
          name: 'Pesquisador NIAR',
          email: 'pesquisador@niar.local',
          role: 'researcher',
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Gerenciamento do usuário' })).toBeInTheDocument();
    expect(screen.getByText('Pesquisador NIAR')).toBeInTheDocument();
    expect(screen.getByText('pesquisador@niar.local')).toBeInTheDocument();
    expect(screen.getByText('Pesquisador')).toBeInTheDocument();
  });

  it('renderiza os dados do cadastro e do COEP', () => {
    render(<PublicUser />);

    expect(screen.getByRole('heading', { name: 'Cadastro de pesquisador' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Instituição')).toBeInTheDocument();
    expect(screen.getByLabelText('Área de pesquisa')).toBeInTheDocument();
    expect(screen.getByLabelText('CAAE')).toBeInTheDocument();
    expect(screen.getByLabelText('Selecionar parecer em PDF')).toBeInTheDocument();
  });

  it('valida os campos obrigatórios antes de chamar a API', async () => {
    render(<PublicUser />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(screen.getByText('Informe o nome completo do pesquisador.')).toBeInTheDocument();
    expect(screen.getByText('Informe um e-mail válido, como nome@instituicao.org.')).toBeInTheDocument();
    expect(screen.getByText('Anexe o parecer do COEP.')).toBeInTheDocument();
    expect(createUserTrigger).not.toHaveBeenCalled();
  });

  it('envia os dados completos e redireciona no modo público', async () => {
    render(<PublicUser mode="public" />);

    expect(screen.getByRole('link', { name: 'Voltar para a Sala Segura' })).toHaveAttribute(
      'href',
      APP_ROUTES.salaSegura,
    );
    expect(screen.getByRole('link', { name: 'Cancelar' })).toHaveAttribute(
      'href',
      APP_ROUTES.salaSegura,
    );

    await fillForm();

    await waitFor(() => expect(createUserTrigger).toHaveBeenCalledWith(expect.objectContaining({
      fullName: 'Ana Beatriz Souza',
      profile: expect.objectContaining({
        institution: 'UFMG',
        phone: '(31) 99999-9999',
      }),
      researcherProfile: expect.objectContaining({ researchArea: 'Saúde pública' }),
      coep: expect.objectContaining({
        caae: '12345678.9.0000.0000',
        opinionNumber: '1234.567',
        approvalDate: '2026-09-25',
        document: expect.any(File),
      }),
    })));
    expect(locationAssignMock).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Cadastro enviado' })).toHaveTextContent(
      'As informações serão verificadas pela equipe responsável e o acesso à plataforma depende da aprovação do cadastro.',
    );
    expect(locationAssignMock).not.toHaveBeenCalled();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Entendi' }));

    expect(locationAssignMock).toHaveBeenCalledWith(APP_ROUTES.salaSegura);
  });

  it('exibe erro de campo devolvido pelo backend', async () => {
    const apiError: ApiError = {
      message: 'Este e-mail já está cadastrado.',
      status: 409,
      fieldErrors: { email: 'Este e-mail já está cadastrado.' },
    };
    createUserTrigger.mockReturnValueOnce({
      unwrap: vi.fn().mockRejectedValueOnce(apiError),
    });

    render(<PublicUser />);
    await fillForm();

    expect(await screen.findAllByText('Este e-mail já está cadastrado.')).toHaveLength(2);
  });

  it('desabilita o envio enquanto a mutação está pendente', () => {
    setCreateState({ isLoading: true });
    render(<PublicUser />);

    expect(screen.getByRole('button', { name: 'Cadastrando…' })).toBeDisabled();
  });
});
