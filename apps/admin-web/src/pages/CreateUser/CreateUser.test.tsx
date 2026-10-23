import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CreateUser } from './CreateUser';
import usersReducer, { clearUsersState } from '../../store/users/users.slice';
import specialtiesReducer from '../../store/specialties/specialties.slice';

const navigateMock = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  Link: ({ children, ...rest }: any) => <a {...rest}>{children}</a>,
}));

const fetchMock = vi.hoisted(() => {
  const mock = vi.fn();
  globalThis.fetch = mock as typeof fetch;
  return mock;
});

vi.mock('@niar/ui', () => ({
  Form: ({ title, description, children }: any) => (
    <section>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </section>
  ),
  Button: ({ children, onClick, disabled, href, ...rest }: any) =>
    href ? <a href={href} {...rest}>{children}</a> : (
      <button onClick={onClick} disabled={disabled} {...rest}>{children}</button>
    ),
  Snackbar: ({ open, message }: any) =>
    open ? <div role="alert" data-testid="global-snackbar">{message}</div> : null,
  Link: ({ children, href, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
  Icon: () => null,
  Input: ({ label, value, onChange, onBlur, error, helperText, name }: any) => (
    <label>
      {label}
      <input
        aria-label={label}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
      />
      {error && helperText ? <span role="alert">{helperText}</span> : null}
    </label>
  ),
  DatePicker: ({ label, value, onChange, onBlur, error, helperText }: any) => (
    <label>
      {label}
      <input
        aria-label={label}
        type="date"
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
      />
      {error && helperText ? <span role="alert">{helperText}</span> : null}
    </label>
  ),
  FileUpload: ({ label, onChange }: any) => (
    <label>
      {label}
      <input
        aria-label={label}
        type="file"
        onChange={(event) =>
          onChange?.([...((event.target as HTMLInputElement).files ?? [])])
        }
      />
    </label>
  ),
  Autocomplete: ({ label, options = [], value, onChange }: any) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={
          value == null
            ? ''
            : typeof value === 'string'
            ? value
            : value.value ?? ''
        }
        onChange={(event) => {
          const found =
            options.find((o: any) => String(o.value) === event.target.value) ?? null;
          onChange?.(null, found);
        }}
      >
        <option value="">Selecione</option>
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  ),
}));

function makeStore() {
  return configureStore({
    reducer: { users: usersReducer, specialties: specialtiesReducer },
  });
}

function renderCreateUser() {
  const store = makeStore();
  store.dispatch(clearUsersState());
  const view = render(
    <Provider store={store}>
      <CreateUser />
    </Provider>,
  );
  return { store, ...view };
}

async function selectRole(role: string) {
  await userEvent.setup().selectOptions(screen.getByLabelText('Perfil'), role);
}

function lastFetchCall() {
  const calls = fetchMock.mock.calls;
  return calls[calls.length - 1] as [string, RequestInit] | undefined;
}

function jsonResponse(body: unknown, status = 201) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const CREATED_USER = {
  id: 99,
  full_name: 'Novo Usuário',
  email: 'novo@niar-saude.org',
  role: 'researcher',
  created_at: '2026-10-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  navigateMock.mockReset();
  fetchMock.mockReset();
  fetchMock.mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes('/specialties')) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            items: [
              {
                id: 42,
                code: 'CARD',
                name: 'Cardiologia',
                description: '',
                guidanceContext: '',
                isActive: true,
              },
            ],
            pagination: { page: 1, page_size: 20, total_items: 1, total_pages: 1 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    }

    return Promise.resolve(jsonResponse(CREATED_USER));
  });
});

afterEach(() => cleanup());

describe('CreateUser — seleção de role', () => {
  it('começa com pesquisador selecionado e mostra os 3 blocos de campo', () => {
    renderCreateUser();

    expect(screen.getByLabelText('Perfil')).toHaveValue('researcher');
    expect(screen.getByLabelText('CAAE')).toBeInTheDocument();
    expect(screen.getByLabelText('Instituição')).toBeInTheDocument();
    expect(screen.getByLabelText('Selecionar parecer em PDF')).toBeInTheDocument();
  });

  it.each([
    ['admin', false, false, false],
    ['auditor', false, false, false],
    ['committee', true, false, true],
    ['researcher', true, true, false],
  ] as const)(
    'role %s mostra os campos corretos',
    async (role, hasSpecialty, hasResearcherField, hasCommitteeField) => {
      renderCreateUser();
      await selectRole(role);

      if (hasResearcherField) {
        expect(screen.getByLabelText('Instituição')).toBeInTheDocument();
        expect(screen.getByLabelText('CAAE')).toBeInTheDocument();
      } else {
        expect(screen.queryByLabelText('Instituição')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('CAAE')).not.toBeInTheDocument();
      }

      if (hasCommitteeField) {
        expect(screen.getByLabelText('Especialidade')).toBeInTheDocument();
      } else {
        expect(screen.queryByLabelText('Especialidade')).not.toBeInTheDocument();
      }
    },
  );

  it('trocar de pesquisador para admin some com os campos do pesquisador', async () => {
    renderCreateUser();
    expect(screen.getByLabelText('CAAE')).toBeInTheDocument();

    await selectRole('admin');

    expect(screen.queryByLabelText('CAAE')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Instituição')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument();
  });
});

describe('CreateUser — payloads por role', () => {
  async function fillShared() {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Nome completo'), 'Novo Usuário');
    await user.type(screen.getByLabelText('E-mail'), 'novo@niar-saude.org');
    await user.type(screen.getByLabelText('Senha'), 'senhaforte1');
    await user.type(screen.getByLabelText('Repetir senha'), 'senhaforte1');
  }

  it('pesquisador envia multipart para /users/researchers com coep_document', async () => {
    renderCreateUser();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Nome completo'), 'Ana Souza');
    await user.type(screen.getByLabelText('E-mail'), 'ana@niar-saude.org');
    await user.type(screen.getByLabelText('Senha'), 'senhaforte1');
    await user.type(screen.getByLabelText('Repetir senha'), 'senhaforte1');
    await user.type(screen.getByLabelText('Telefone'), '31999999999');
    await user.type(screen.getByLabelText('Instituição'), 'UFMG');
    await user.type(screen.getByLabelText('Unidade organizacional'), 'Medicina');
    await user.type(screen.getByLabelText('Endereço de contato'), 'BH');
    await user.type(screen.getByLabelText('Área de pesquisa'), 'Saúde');
    await user.type(screen.getByLabelText('Cargo ou vínculo'), 'Professora');
    await user.type(screen.getByLabelText('CAAE'), '12345678');
    await user.type(screen.getByLabelText('Número do parecer'), '123');
    await user.type(screen.getByLabelText('Data de aprovação'), '2026-09-25');
    await user.upload(
      screen.getByLabelText('Selecionar parecer em PDF'),
      new File(['pdf'], 'parecer.pdf', { type: 'application/pdf' }),
    );

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = lastFetchCall()!;

    expect(url).toContain('/users/researchers');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get('coep_document')).toBeTruthy();
  });

  it('admin envia JSON para /users/administrators sem passwordConfirmation', async () => {
    renderCreateUser();
    await selectRole('admin');
    await fillShared();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = lastFetchCall()!;
    const body = JSON.parse(String(init.body));

    expect(url).toContain('/users/administrators');
    expect(body).toEqual({
      full_name: 'Novo Usuário',
      email: 'novo@niar-saude.org',
      password: 'senhaforte1',
    });
    expect(body).not.toHaveProperty('passwordConfirmation');
    expect(body).not.toHaveProperty('password_confirmation');
  });

  it('auditor envia JSON para /users/auditors', async () => {
    renderCreateUser();
    await selectRole('auditor');
    await fillShared();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url] = lastFetchCall()!;
    expect(url).toContain('/users/auditors');
  });

  it('committee envia specialty_id numérico e não specialtyId nem objeto', async () => {
    const { store } = renderCreateUser();
    await selectRole('committee');
    await fillShared();

    const specialtySelect = screen.getByLabelText('Especialidade');
    await waitFor(() => expect(within(specialtySelect).getByText('Cardiologia')).toBeInTheDocument());
    await userEvent.setup().selectOptions(specialtySelect, '42');

    await userEvent.setup().click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = lastFetchCall()!;
    const body = JSON.parse(String(init.body));

    expect(url).toContain('/users/committee-members');
    expect(body.specialty_id).toBe(42);
    expect(body).not.toHaveProperty('specialtyId');
    expect(typeof body.specialty_id).toBe('number');
  });
});

describe('CreateUser — especialidades', () => {
  it('ao entrar em committee, dispara fetchSpecialties com isActive: true', async () => {
    renderCreateUser();
    fetchMock.mockClear();

    await selectRole('committee');

    await waitFor(() => {
      const call = fetchMock.mock.calls.find(([url]) =>
        String(url).includes('/specialties'),
      );
      expect(call).toBeDefined();
    });

    const call = fetchMock.mock.calls.find(([url]) => String(url).includes('/specialties'))!;
    expect(String(call[0])).toContain('is_active=true');
  });
});

describe('CreateUser — validação', () => {
  it('submit vazio mostra erros nos campos básicos', async () => {
    renderCreateUser();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('senhas diferentes bloqueiam o submit', async () => {
    renderCreateUser();
    await selectRole('admin');

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Nome completo'), 'Ana');
    await user.type(screen.getByLabelText('E-mail'), 'ana@x.org');
    await user.type(screen.getByLabelText('Senha'), 'senhaforte1');
    await user.type(screen.getByLabelText('Repetir senha'), 'outrasenha');

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(screen.getByText('As senhas não conferem.')).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('CreateUser — COEP', () => {
  it('submit sem PDF mostra erro no FileUpload', async () => {
    renderCreateUser();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Nome completo'), 'Ana');
    await user.type(screen.getByLabelText('E-mail'), 'ana@x.org');
    await user.type(screen.getByLabelText('Senha'), 'senhaforte1');
    await user.type(screen.getByLabelText('Repetir senha'), 'senhaforte1');
    await user.type(screen.getByLabelText('Telefone'), '31999999999');
    await user.type(screen.getByLabelText('Instituição'), 'UFMG');
    await user.type(screen.getByLabelText('Unidade organizacional'), 'Med');
    await user.type(screen.getByLabelText('Endereço de contato'), 'BH');
    await user.type(screen.getByLabelText('Área de pesquisa'), 'Saúde');
    await user.type(screen.getByLabelText('Cargo ou vínculo'), 'Prof');
    await user.type(screen.getByLabelText('CAAE'), '1');
    await user.type(screen.getByLabelText('Número do parecer'), '1');
    await user.type(screen.getByLabelText('Data de aprovação'), '2026-09-25');

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(screen.getByText('Anexe o parecer do COEP.')).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('CreateUser — loading e sucesso', () => {
  it('durante pending o botão fica disabled e mostra "Cadastrando…"', async () => {
    let resolveFetch: ((r: Response) => void) | undefined;
    fetchMock.mockImplementation(
      () => new Promise<Response>((r) => { resolveFetch = r; }),
    );

    renderCreateUser();
    await selectRole('admin');
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Nome completo'), 'X');
    await user.type(screen.getByLabelText('E-mail'), 'x@x.org');
    await user.type(screen.getByLabelText('Senha'), 'senhaforte1');
    await user.type(screen.getByLabelText('Repetir senha'), 'senhaforte1');

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cadastrando…' })).toBeDisabled();
    });

    resolveFetch!(jsonResponse({ ...CREATED_USER, role: 'admin' }));
  });

  it('após sucesso navega para a listagem', async () => {
    renderCreateUser();
    await selectRole('admin');
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Nome completo'), 'X');
    await user.type(screen.getByLabelText('E-mail'), 'x@x.org');
    await user.type(screen.getByLabelText('Senha'), 'senhaforte1');
    await user.type(screen.getByLabelText('Repetir senha'), 'senhaforte1');

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/admin/administrador/usuarios');
    });
  });
});

describe('CreateUser — erros da API', () => {
  it('409 de e-mail duplicado mostra snackbar e erro no campo', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: 'User with this email already exists' }, 409),
    );

    renderCreateUser();
    await selectRole('admin');
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Nome completo'), 'X');
    await user.type(screen.getByLabelText('E-mail'), 'x@x.org');
    await user.type(screen.getByLabelText('Senha'), 'senhaforte1');
    await user.type(screen.getByLabelText('Repetir senha'), 'senhaforte1');

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(screen.getByTestId('global-snackbar')).toHaveTextContent(
        'Este e-mail já está cadastrado.',
      );
    });
    expect(screen.getAllByText('Este e-mail já está cadastrado.').length).toBeGreaterThan(1);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('400 com fieldErrors aplica erro nos campos', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          errors: [{ path: ['email'], message: 'Invalid email address' }],
        },
        400,
      ),
    );

    renderCreateUser();
    await selectRole('admin');
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Nome completo'), 'X');
    await user.type(screen.getByLabelText('E-mail'), 'x@x.org');
    await user.type(screen.getByLabelText('Senha'), 'senhaforte1');
    await user.type(screen.getByLabelText('Repetir senha'), 'senhaforte1');

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(
        screen.getByText('Informe um e-mail válido, como nome@instituicao.org.'),
      ).toBeInTheDocument();
    });
  });
});
