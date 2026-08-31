import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersPage } from './users-page';
import type { ApiError } from '../types/user';

/**
 * O hook é substituído por mock: aqui interessa o comportamento da tela,
 * não a integração com a API (essa é coberta nos testes do hook real).
 */
const useCreateUserMock = vi.fn();

vi.mock('../hooks/use-users', () => ({
  useCreateUser: () => useCreateUserMock(),
}));

const mutateAsync = vi.fn();

function setCreateState(overrides: Record<string, unknown> = {}) {
  useCreateUserMock.mockReturnValue({
    mutateAsync,
    isPending: false,
    error: null,
    reset: vi.fn(),
    ...overrides,
  });
}

async function fillForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Nome completo'), 'Ana Beatriz Souza');
  await user.type(screen.getByLabelText('E-mail'), 'ana.souza@niar-saude.org');
  await user.type(screen.getByLabelText('Senha'), 'senhaforte1');
  await user.click(screen.getByRole('button', { name: 'Cadastrar pesquisador' }));
}

beforeEach(() => {
  vi.clearAllMocks();
  setCreateState();
  mutateAsync.mockResolvedValue({
    id: '3',
    fullName: 'Ana Beatriz Souza',
    email: 'ana.souza@niar-saude.org',
    role: 'researcher',
    createdAt: '2026-08-31T12:00:00.000Z',
  });
});

describe('UsersPage — cadastro de pesquisador', () => {
  it('renderiza a tela e o formulário com os campos visíveis do escopo', () => {
    render(<UsersPage />);

    expect(screen.getByRole('heading', { name: 'Cadastro de pesquisador' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
  });

  it('não exibe seletor de perfil', () => {
    render(<UsersPage />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/perfil/i)).not.toBeInTheDocument();
  });

  it('valida os campos antes de chamar a API', async () => {
    render(<UsersPage />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Cadastrar pesquisador' }));

    expect(screen.getByText('Informe o nome completo do pesquisador.')).toBeInTheDocument();
    expect(
      screen.getByText('Informe um e-mail válido, como nome@instituicao.org.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('A senha precisa ter pelo menos 8 caracteres.'),
    ).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('envia o cadastro com role "researcher" definido internamente', async () => {
    render(<UsersPage />);
    await fillForm();

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        fullName: 'Ana Beatriz Souza',
        email: 'ana.souza@niar-saude.org',
        password: 'senhaforte1',
        role: 'researcher',
      });
    });
  });

  it('mostra a mensagem de sucesso e limpa o formulário após o cadastro', async () => {
    render(<UsersPage />);
    await fillForm();

    expect(
      await screen.findByText('Ana Beatriz Souza foi cadastrado(a) como pesquisador(a).'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toHaveValue('');
    expect(screen.getByLabelText('E-mail')).toHaveValue('');
    expect(screen.getByLabelText('Senha')).toHaveValue('');
  });

  it('mostra o estado de envio no botão e evita duplo envio', () => {
    setCreateState({ isPending: true });
    render(<UsersPage />);

    const button = screen.getByRole('button', { name: 'Cadastrando…' });
    expect(button).toBeDisabled();
  });

  it('exibe o erro devolvido pelo backend, inclusive no campo certo', async () => {
    const apiError: ApiError = {
      message: 'Este e-mail já está cadastrado.',
      status: 409,
      fieldErrors: { email: 'Este e-mail já está cadastrado.' },
    };
    mutateAsync.mockRejectedValueOnce(apiError);

    render(<UsersPage />);
    await fillForm();

    expect(await screen.findAllByText('Este e-mail já está cadastrado.')).toHaveLength(2);
    // Os valores digitados permanecem para a pessoa corrigir e reenviar.
    expect(screen.getByLabelText('Nome completo')).toHaveValue('Ana Beatriz Souza');
  });
});
