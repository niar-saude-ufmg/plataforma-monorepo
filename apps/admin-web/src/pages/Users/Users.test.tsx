import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { Users } from './Users';
import { store } from '../../store';
import { setSelectedAuthUser, clearSelectedAuthUser } from '../../store/auth/auth.slice';
import { clearUsersState } from '../../store/users/users.slice';

const fetchMock = vi.hoisted(() => {
  const mock = vi.fn();
  globalThis.fetch = mock as typeof fetch;
  return mock;
});

vi.mock('@niar/ui', async () => {
  const { Details, Dialog, RadioGroup, Textarea, ListText, Card } = await vi.importActual<typeof import('@niar/ui')>('@niar/ui');
  const Listing = ({
    title,
    "aria-level": _ariaLevel,
    description,
    action,
    filter,
    columns,
    rows = [],
    loading,
    pagination,
    emptyState,
  }: any) => {
    const hasRows = rows.length > 0;
    return (
      <section data-testid="listing">
        <h1>{title}</h1>
        {hasRows ? <p data-testid="listing-description">{description}</p> : null}
        {hasRows && action ? <div data-testid="listing-action">{action}</div> : null}

        {loading ? (
          <div data-testid="listing-loading">
            <div data-testid="listing-loading-header" />
            {filter ? <div data-testid="listing-loading-filter" /> : null}
            <div data-testid="listing-loading-rows" />
          </div>
        ) : !hasRows ? (
          <div role="status" aria-label="Lista de registros vazia" data-testid="listing-empty">
            <h2>{emptyState?.title ?? 'Nenhum registro encontrado'}</h2>
            <p>{emptyState?.description ?? 'Não há dados para exibir no momento.'}</p>
            {emptyState?.action}
          </div>
        ) : (
          <div data-testid="listing-card">
            <div data-testid="listing-filter">{filter}</div>
            <table>
              <thead>
                <tr>
                  {columns?.map((c: any) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any, i: number) => (
                  <tr key={i} data-testid={`row-${i}`}>
                    {columns?.map((c: any) => (
                      <td key={c.key} data-testid={`cell-${c.key}-${i}`}>
                        {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination ? (
              <div data-testid="pagination">
                <span data-testid="pagination-page">{pagination.page}</span>
                <span data-testid="pagination-rowsPerPage">{pagination.rowsPerPage}</span>
                <span data-testid="pagination-count">{pagination.count}</span>
                <button onClick={() => pagination.onPageChange?.(null, pagination.page + 1)}>
                  Próxima
                </button>
                <button onClick={() => pagination.onPageChange?.(null, Math.max(pagination.page - 1, 0))}>
                  Anterior
                </button>
              </div>
            ) : null}
          </div>
        )}
      </section>
    );
  };

  const Filter = ({ search, values, onChange }: any) => (
    <div data-testid="filter">
      {search?.map((s: any) => {
        const id = `filter-${s.key}`;
        return (
          <div key={s.key}>
            <label htmlFor={id}>{s.label}</label>
            {s.freeSolo ? (
              <input
                id={id}
                aria-label={s.label}
                defaultValue={values?.[s.key] ?? ''}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    onChange({ ...values, [s.key]: event.currentTarget.value || null });
                  }
                }}
                onBlur={(event) =>
                  onChange({ ...values, [s.key]: event.currentTarget.value || null })
                }
              />
            ) : (
              <select
                id={id}
                aria-label={s.label}
                value={values?.[s.key]?.value ?? ''}
                onChange={(event) => {
                  const option =
                    s.options.find((o: any) => o.value === event.target.value) ?? null;
                  onChange({ ...values, [s.key]: option });
                }}
              >
                <option value="">Todos</option>
                {s.options.map((o: any) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );

  return {
    Details, Dialog, RadioGroup, Textarea, ListText, Card,
    Listing,
    Filter,
    Autocomplete: ({ label, options, value, onChange, freeSolo }: any) => freeSolo ? (
      <input
        aria-label={label}
        defaultValue={typeof value === 'string' ? value : value?.value ?? ''}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onChange(undefined, event.currentTarget.value || null);
          }
        }}
        onBlur={(event) => onChange(undefined, event.currentTarget.value || null)}
      />
    ) : (
      <select
        aria-label={label}
        value={value?.value ?? ''}
        onChange={(event) =>
          onChange(options?.find((o: any) => o.value === event.target.value) ?? null)
        }
      >
        <option value="">Todos</option>
        {options?.map((o: any) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ),
    Button: ({ children, ...rest }: any) => <button {...rest}>{children}</button>,
    StatusChip: ({ label, status }: any) => (
      <span data-testid="status-chip" data-status={status}>
        {label}
      </span>
    ),
    Snackbar: ({ message, open }: any) =>
      open ? (
        <div role="alert" data-testid="global-snackbar">
          {message}
        </div>
      ) : null,
  };
});

const API_ITEM_BASE = {
  created_at: '2026-01-01T00:00:00.000Z',
  profile: null,
  researcher_profile: null,
  committee_profile: null,
  coep: null,
  latest_auth_evaluation: null,
};

const USERS_LIST_RESPONSE = {
  items: [
    { ...API_ITEM_BASE, id: 1, full_name: 'Alice Pesquisadora', email: 'alice@x.org', role: 'researcher', account_status: 'active' },
    { ...API_ITEM_BASE, id: 2, full_name: 'Bruno Admin',        email: 'bruno@x.org', role: 'admin',      account_status: 'pending' },
    { ...API_ITEM_BASE, id: 3, full_name: 'Carla Comitê',       email: 'carla@x.org', role: 'committee',  account_status: 'disabled' },
  ],
  pagination: { page: 1, page_size: 20, total_items: 3, total_pages: 1 },
};

const EMPTY_LIST_RESPONSE = {
  items: [],
  pagination: { page: 1, page_size: 20, total_items: 0, total_pages: 0 },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderUsers() {
  return render(
    <Provider store={store}>
      <Users />
    </Provider>,
  );
}

function usersListCalls() {
  return fetchMock.mock.calls.filter(([url]) =>
    String(url).includes('/api/admin/users'),
  );
}

function lastUsersUrl(): URL {
  const calls = usersListCalls();
  const last = calls[calls.length - 1];
  return new URL(String(last[0]), 'http://localhost');
}

beforeEach(() => {
  vi.clearAllMocks();
  store.dispatch(clearUsersState());
  fetchMock.mockReset();
  fetchMock.mockImplementation(() =>
    Promise.resolve(jsonResponse(USERS_LIST_RESPONSE)),
  );
});

afterEach(() => {
  cleanup();
});

describe('Users — disparo inicial e contrato de URL', () => {
  it('dispara a primeira busca no mount com page=1 e sem filtros', async () => {
    renderUsers();

    await waitFor(() => expect(usersListCalls().length).toBeGreaterThan(0));

    const url = lastUsersUrl();
    expect(url.pathname.endsWith('/api/admin/users')).toBe(true);
    expect(url.searchParams.get('page')).toBe('1');
    expect(url.searchParams.has('search')).toBe(false);
    expect(url.searchParams.has('role')).toBe(false);
    expect(url.searchParams.has('account_status')).toBe(false);
  });

  it('envia page_size igual a DEFAULT_USERS_PAGE_SIZE (5)', async () => {
    renderUsers();

    await waitFor(() => expect(usersListCalls().length).toBeGreaterThan(0));
    expect(lastUsersUrl().searchParams.get('page_size')).toBe('5');
  });
});

describe('Users — colunas e células', () => {
  it('renderiza Nome, E-mail, Perfil, Status e Ações na ordem esperada', async () => {
    renderUsers();

    await waitFor(() =>
      expect(screen.getByRole('columnheader', { name: 'Nome' })).toBeInTheDocument(),
    );

    const headers = screen
      .getAllByRole('columnheader')
      .map((h) => h.textContent);
    expect(headers).toEqual(['Nome', 'E-mail', 'Perfil', 'Status', 'Ações']);
  });

  it('traduz role e accountStatus para labels legíveis e StatusChip correto', async () => {
    renderUsers();

    await waitFor(() => expect(screen.getByTestId('row-0')).toBeInTheDocument());

    const row0 = screen.getByTestId('row-0');
    expect(within(row0).getByText('Pesquisador')).toBeInTheDocument();
    expect(within(row0).getByText('Ativo')).toBeInTheDocument();
    expect(within(row0).getByTestId('status-chip')).toHaveAttribute('data-status', 'success');

    const row1 = screen.getByTestId('row-1');
    expect(within(row1).getByText('Administrador')).toBeInTheDocument();
    expect(within(row1).getByText('Pendente')).toBeInTheDocument();
    expect(within(row1).getByTestId('status-chip')).toHaveAttribute('data-status', 'warning');

    const row2 = screen.getByTestId('row-2');
    expect(within(row2).getByText('Comissão')).toBeInTheDocument();
    expect(within(row2).getByText('Desativado')).toBeInTheDocument();
    expect(within(row2).getByTestId('status-chip')).toHaveAttribute('data-status', 'default');
  });

  it('exibe botões de ação conforme role e accountStatus', async () => {
    renderUsers();

    await waitFor(() => expect(screen.getByTestId('row-0')).toBeInTheDocument());

    const row0 = screen.getByTestId('row-0');
    expect(within(row0).getByRole('button', { name: 'Detalhes' })).toBeInTheDocument();
    expect(within(row0).getByRole('button', { name: 'Desativar' })).toBeInTheDocument();
    expect(within(row0).queryByRole('button', { name: 'Avaliar' })).not.toBeInTheDocument();
    const row1 = screen.getByTestId('row-1');
    expect(within(row1).getAllByRole('button')).toHaveLength(1);
    const row2 = screen.getByTestId('row-2');
    expect(within(row2).getByRole('button', { name: 'Ativar' })).toBeInTheDocument();
  });
});

describe('Users — filtros', () => {
  it('envia a busca pelo nome e reseta page=1', async () => {
    const user = userEvent.setup();
    renderUsers();

    await waitFor(() => expect(screen.getByTestId('row-0')).toBeInTheDocument());
    const before = usersListCalls().length;

    const searchInput = screen.getByLabelText('Buscar usuário');
    await user.type(searchInput, 'Alice Pesquisadora');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(usersListCalls().length).toBeGreaterThan(before));
    const url = lastUsersUrl();
    expect(url.searchParams.get('search')).toBe('Alice Pesquisadora');
    expect(url.searchParams.get('page')).toBe('1');
  });

  it('envia role e reseta page=1 ao trocar o filtro de perfil', async () => {
    const user = userEvent.setup();
    renderUsers();

    await waitFor(() => expect(screen.getByTestId('row-0')).toBeInTheDocument());
    const before = usersListCalls().length;

    await user.selectOptions(screen.getByLabelText('Perfil'), 'researcher');

    await waitFor(() => expect(usersListCalls().length).toBeGreaterThan(before));
    const url = lastUsersUrl();
    expect(url.searchParams.get('role')).toBe('researcher');
    expect(url.searchParams.get('page')).toBe('1');
  });

  it('envia account_status e reseta page=1 ao trocar o filtro de status', async () => {
    const user = userEvent.setup();
    renderUsers();

    await waitFor(() => expect(screen.getByTestId('row-0')).toBeInTheDocument());
    const before = usersListCalls().length;

    await user.selectOptions(screen.getByLabelText('Status'), 'pending');

    await waitFor(() => expect(usersListCalls().length).toBeGreaterThan(before));
    const url = lastUsersUrl();
    expect(url.searchParams.get('account_status')).toBe('pending');
    expect(url.searchParams.get('page')).toBe('1');
  });

  it('combina role e account_status na mesma query', async () => {
    const user = userEvent.setup();
    renderUsers();

    await waitFor(() => expect(screen.getByTestId('row-0')).toBeInTheDocument());

    await user.selectOptions(screen.getByLabelText('Perfil'), 'researcher');
    await waitFor(() =>
      expect(lastUsersUrl().searchParams.get('role')).toBe('researcher'),
    );

    await user.selectOptions(screen.getByLabelText('Status'), 'active');
    await waitFor(() => {
      const url = lastUsersUrl();
      expect(url.searchParams.get('role')).toBe('researcher');
      expect(url.searchParams.get('account_status')).toBe('active');
    });
  });

  it('não envia o parâmetro quando o filtro é limpo e volta para page=1', async () => {
    const user = userEvent.setup();
    renderUsers();

    await waitFor(() => expect(screen.getByTestId('row-0')).toBeInTheDocument());

    await user.selectOptions(screen.getByLabelText('Perfil'), 'researcher');
    await waitFor(() => expect(lastUsersUrl().searchParams.get('role')).toBe('researcher'));

    await user.selectOptions(screen.getByLabelText('Perfil'), '');

    await waitFor(() => {
      const url = lastUsersUrl();
      expect(url.searchParams.has('role')).toBe(false);
      expect(url.searchParams.get('page')).toBe('1');
    });
  });

  it('nunca envia "Todos" nem valores vazios como filtro', async () => {
    renderUsers();

    await waitFor(() => expect(usersListCalls().length).toBeGreaterThan(0));

    for (const call of usersListCalls()) {
      const url = new URL(String(call[0]), 'http://localhost');
      expect(url.searchParams.get('role')).not.toBe('Todos');
      expect(url.searchParams.get('account_status')).not.toBe('Todos');
      expect(url.searchParams.get('role')).not.toBe('');
      expect(url.searchParams.get('account_status')).not.toBe('');
    }
  });
});

describe('Users — paginação', () => {
  it('converte UI 0-based para API 1-based ao avançar', async () => {
    const user = userEvent.setup();
    renderUsers();

    await waitFor(() => expect(screen.getByTestId('row-0')).toBeInTheDocument());
    expect(screen.getByTestId('pagination-page')).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: 'Próxima' }));

    await waitFor(() => expect(lastUsersUrl().searchParams.get('page')).toBe('2'));
    expect(screen.getByTestId('pagination-page')).toHaveTextContent('1');
  });

  it('volta uma página ao clicar em Anterior', async () => {
    const user = userEvent.setup();
    renderUsers();

    await waitFor(() => expect(screen.getByTestId('row-0')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Próxima' }));
    await waitFor(() => expect(lastUsersUrl().searchParams.get('page')).toBe('2'));

    await user.click(screen.getByRole('button', { name: 'Anterior' }));
    await waitFor(() => expect(lastUsersUrl().searchParams.get('page')).toBe('1'));
  });

  it('propaga count e rowsPerPage do slice para a paginação', async () => {
    renderUsers();

    await waitFor(() =>
      expect(screen.getByTestId('pagination-count')).toHaveTextContent('3'),
    );
    expect(screen.getByTestId('pagination-rowsPerPage')).toHaveTextContent('5');
  });
});

describe('Users — estados de lista', () => {
  it('mostra loading enquanto a requisição está em andamento', async () => {
    let resolveFetch: ((value: Response) => void) | undefined;
    fetchMock.mockImplementation(
      () => new Promise<Response>((resolve) => { resolveFetch = resolve; }),
    );

    renderUsers();

    await screen.findByTestId('listing-loading');
    expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
    expect(screen.queryByTestId('listing-filter')).not.toBeInTheDocument();
    expect(resolveFetch).toBeDefined();

    resolveFetch!(jsonResponse(USERS_LIST_RESPONSE));


    await waitFor(() =>
      expect(screen.queryByTestId('listing-loading')).not.toBeInTheDocument(),
    );
  });

  it('mostra empty state padrão quando não há usuários e nenhum filtro ativo', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse(EMPTY_LIST_RESPONSE)),
    );
    renderUsers();

    await waitFor(() =>
      expect(screen.getByTestId('listing-empty')).toBeInTheDocument(),
    );
    expect(screen.getByText('Nenhum usuário cadastrado')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Limpar filtros' }),
    ).not.toBeInTheDocument();
  });

  it('mostra empty state com ação "Limpar filtros" quando há filtro ativo', async () => {
    const user = userEvent.setup();
    renderUsers();

    await waitFor(() => expect(screen.getByTestId('row-0')).toBeInTheDocument());

    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse(EMPTY_LIST_RESPONSE)),
    );
    await user.selectOptions(screen.getByLabelText('Perfil'), 'researcher');

    await waitFor(() =>
      expect(screen.getByTestId('listing-empty')).toBeInTheDocument(),
    );
    expect(screen.getByText('Nenhum usuário encontrado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument();
  });

  it('clicar em "Limpar filtros" refaz a busca sem filtros e volta para page=1', async () => {
    const user = userEvent.setup();
    renderUsers();

    await waitFor(() => expect(screen.getByTestId('row-0')).toBeInTheDocument());

    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse(EMPTY_LIST_RESPONSE)),
    );
    await user.selectOptions(screen.getByLabelText('Perfil'), 'researcher');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument(),
    );

    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse(USERS_LIST_RESPONSE)),
    );
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    await waitFor(() => {
      const url = lastUsersUrl();
      expect(url.searchParams.has('role')).toBe(false);
      expect(url.searchParams.has('account_status')).toBe(false);
      expect(url.searchParams.has('search')).toBe(false);
      expect(url.searchParams.get('page')).toBe('1');
    });
  });
});

describe('Users — erro', () => {
  it('exibe Snackbar quando a API retorna erro', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse({ error: 'boom' }, 500)),
    );

    renderUsers();

    await waitFor(() =>
      expect(screen.getByTestId('global-snackbar')).toBeInTheDocument(),
    );
  });
});


describe('Users — detalhes da linha selecionada', () => {
  it('seleciona a linha, usa sua configuração e fecha sem nova chamada à API', async () => {
    const user = userEvent.setup();
    renderUsers();
    const row = await screen.findByTestId('row-0');
    const callsBefore = usersListCalls().length;

    await user.click(within(row).getByRole('button', { name: 'Detalhes' }));

    const dialog = screen.getByRole('dialog');
    expect(store.getState().users.selected).toEqual(store.getState().users.list.items[0]);
    expect(within(dialog).getByText('Detalhes de Alice Pesquisadora')).toBeInTheDocument();
    expect(within(dialog).getByText('Alice Pesquisadora')).toBeInTheDocument();
    for (const title of ['Dados da conta', 'Dados do COEP']) {
      expect(within(dialog).getByRole('heading', { name: title })).toBeInTheDocument();
    }
    expect(usersListCalls()).toHaveLength(callsBefore);

    await user.click(within(dialog).getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(store.getState().users.selected).toBeNull();

    await user.click(within(screen.getByTestId('row-1')).getByRole('button', { name: 'Detalhes' }));
    expect(within(screen.getByRole('dialog')).getByText('Bruno Admin')).toBeInTheDocument();
    expect(screen.getByText('Detalhes de Bruno Admin')).toBeInTheDocument();
    expect(store.getState().users.selected?.id).toBe(2);
    expect(usersListCalls()).toHaveLength(callsBefore);
  });

  it('limpa a seleção ao sair da listagem', async () => {
    const user = userEvent.setup();
    const view = renderUsers();
    await user.click(within(await screen.findByTestId('row-2')).getByRole('button', { name: 'Detalhes' }));
    expect(screen.getByText('Detalhes de Carla Comitê')).toBeInTheDocument();
    view.unmount();
    expect(store.getState().users.selected).toBeNull();
  });
});

describe('Users — gestão de acesso conforme Figma', () => {
  it('mostra somente as ações permitidas por perfil e status', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      ...USERS_LIST_RESPONSE,
      items: [
        { ...USERS_LIST_RESPONSE.items[0], account_status: 'pending' },
        { ...USERS_LIST_RESPONSE.items[1], account_status: 'active' },
        { ...USERS_LIST_RESPONSE.items[2], account_status: 'disabled' },
        { ...USERS_LIST_RESPONSE.items[0], id: 4, account_status: 'rejected' },
      ],
    }));
    renderUsers();
    await screen.findByTestId('row-3');
    expect(within(screen.getByTestId('row-0')).getAllByRole('button').map(button => button.textContent)).toEqual(['Detalhes', 'Avaliar']);
    expect(within(screen.getByTestId('row-1')).getAllByRole('button').map(button => button.textContent)).toEqual(['Detalhes', 'Desativar']);
    expect(within(screen.getByTestId('row-2')).getAllByRole('button').map(button => button.textContent)).toEqual(['Detalhes', 'Ativar']);
    expect(within(screen.getByTestId('row-3')).getAllByRole('button').map(button => button.textContent)).toEqual(['Detalhes']);
    expect(screen.getByRole('heading', { name: 'Filtros' })).toBeInTheDocument();
  });

  it('só altera o status após confirmar e atualiza a listagem', async () => {
    const user = userEvent.setup();
    let items = USERS_LIST_RESPONSE.items.map(item => ({ ...item }));
    fetchMock.mockImplementation((url, options) => {
      if (options?.method === 'PATCH') {
        const status = JSON.parse(options.body as string).status;
        items = items.map(item => item.id === 1 ? { ...item, account_status: status } : item);
        return Promise.resolve(jsonResponse(items[0]));
      }
      return Promise.resolve(jsonResponse({ ...USERS_LIST_RESPONSE, items }));
    });
    renderUsers();
    await user.click(within(await screen.findByTestId('row-0')).getByRole('button', { name: 'Desativar' }));
    expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'PATCH')).toBe(false);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
    expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'PATCH')).toBe(false);
    await waitFor(() => expect(within(screen.getByTestId('row-0')).getByRole('button', { name: 'Desativar' })).toBeVisible());
    await user.click(within(screen.getByTestId('row-0')).getByRole('button', { name: 'Desativar' }));
    expect(screen.getByText('Deseja desativar o usuário “Alice Pesquisadora”?')).toBeInTheDocument();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Desativar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(within(await screen.findByTestId('row-0')).getByRole('button', { name: 'Ativar' })).toBeInTheDocument();
    expect(store.getState().users.selected).toBeNull();
  });

  it('mantém a confirmação e a seleção quando a API falha', async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation((_url, options) => Promise.resolve(options?.method === 'PATCH'
      ? jsonResponse({ error: 'O status foi alterado por outra operação' }, 409)
      : jsonResponse(USERS_LIST_RESPONSE)));
    renderUsers();
    await user.click(within(await screen.findByTestId('row-0')).getByRole('button', { name: 'Desativar' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Desativar' }));
    expect(await screen.findByText('O status foi alterado por outra operação')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(store.getState().users.selected?.id).toBe(1);
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Desativar' })).toBeEnabled();
  });

  it('exige decisão e justificativa na reprovação e envia a avaliação', async () => {
    const user = userEvent.setup();
    const pending = { ...USERS_LIST_RESPONSE.items[0], account_status: 'pending' };
    fetchMock.mockImplementation((_url, options) => Promise.resolve(options?.method === 'POST'
      ? jsonResponse({ id: 5, user_id: 1, status: 'rejected', justification: 'Parecer inválido', evaluated_by_user_id: 1, evaluated_at: '2026-11-05', created_at: '2026-11-05', user_coep_data_id: null }, 201)
      : jsonResponse({ ...USERS_LIST_RESPONSE, items: [pending] })));
    renderUsers();
    await user.click(within(await screen.findByTestId('row-0')).getByRole('button', { name: 'Avaliar' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar avaliação' }));
    expect(screen.getByText('Selecione a decisão do cadastro.')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('radio', { name: 'Reprovar' }));
    await user.click(within(dialog).getByRole('button', { name: 'Salvar avaliação' }));
    expect(screen.getByText('Informe a justificativa da reprovação.')).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false);
    await user.type(within(dialog).getByLabelText('Justificativa'), 'Parecer inválido');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar avaliação' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const mutation = fetchMock.mock.calls.find(([, options]) => options?.method === 'POST');
    expect(String(mutation?.[0])).toContain('/users/1/auth-evaluation');
    expect(JSON.parse(mutation?.[1]?.body as string)).toEqual({ status: 'rejected', justification: 'Parecer inválido' });
  });
});


it('não oferece desativação da própria conta de administrador', async () => {
  store.dispatch(setSelectedAuthUser({ id: 2, name: 'Bruno Admin', email: 'bruno@x.org', role: 'admin', accountStatus: 'active' }));
  fetchMock.mockResolvedValue(jsonResponse({ ...USERS_LIST_RESPONSE, items: [
    { ...USERS_LIST_RESPONSE.items[1], account_status: 'active' },
    { ...USERS_LIST_RESPONSE.items[0] },
  ] }));
  try {
    renderUsers();
    const ownRow = await screen.findByTestId('row-0');
    expect(within(ownRow).getByRole('button', { name: 'Detalhes' })).toBeInTheDocument();
    expect(within(ownRow).queryByRole('button', { name: 'Desativar' })).not.toBeInTheDocument();
    expect(within(screen.getByTestId('row-1')).getByRole('button', { name: 'Desativar' })).toBeInTheDocument();
  } finally {
    store.dispatch(clearSelectedAuthUser());
  }
});
