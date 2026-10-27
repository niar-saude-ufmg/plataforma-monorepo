import { describe, expect, it } from 'vitest';
import reducer, {
  clearUsersError,
  clearUsersListError,
  clearUsersMutationError,
  clearUsersState,
  clearUsersFilters,
  setSelectedUser,
  setUsersFilters,
  setUsersPage,
  setUsersPageSize
} from './users.slice';
import { selectUsersListError } from './users.selectors';
import {
  createAdministrator,
  createAuditor,
  createCommitteeMember,
  createResearcher,
  createUser,
  downloadUserCoepDocument,
  getUsers,
} from './users.api';
import type { UserListItem } from '../../types/user.types';

const user: UserListItem = {
  id: 3,
  fullName: 'Ana Beatriz Souza',
  email: 'ana.souza@niar-saude.org',
  role: 'researcher' as const,
  createdAt: '2026-08-31T12:00:00.000Z',
  accountStatus: 'pending',
  profile: null,
  researcherProfile: null,
  committeeProfile: null,
  coep: null,
  latestAuthEvaluation: null,
};

const pendingAction = (thunk: any, arg: unknown = {}) =>
  ({ type: thunk.pending.type, meta: { arg } }) as any;
const rejectedAction = (thunk: any, payload: unknown) =>
  ({ type: thunk.rejected.type, payload }) as any;
const fulfilledAction = (thunk: any, payload: unknown) =>
  ({ type: thunk.fulfilled.type, payload }) as any;

describe('usersSlice', () => {
  it('armazena o usuário selecionado', () => {
    const state = reducer(undefined, setSelectedUser(user));

    expect(state).toEqual({
      list: {
        items: [],
        pagination: null,
        filters: {},
        page: 1,
        pageSize: 20,
        status: 'idle',
        error: null,
      },
      selected: user,
      mutation: { operation: null, status: 'idle', error: null },
      download: { status: 'idle', error: null, filename: null },
    });
  });

  it('limpa o estado local de usuários', () => {
    expect(reducer({
      list: {
        items: [user],
        pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
        filters: { role: 'researcher' },
        page: 2,
        pageSize: 20,
        status: 'failed',
        error: { message: 'Falha' },
      },
      selected: user,
      mutation: { operation: null, status: 'idle', error: null },
      download: { status: 'idle', error: null, filename: null },
    }, clearUsersState())).toEqual({
      list: {
        items: [],
        pagination: null,
        filters: {},
        page: 1,
        pageSize: 20,
        status: 'idle',
        error: null,
      },
      selected: null,
      mutation: { operation: null, status: 'idle', error: null },
      download: { status: 'idle', error: null, filename: null },
    });
  });

  it('expõe null no seletor quando não há erro', () => {
    const state = reducer(undefined, { type: 'unknown' });

    expect(selectUsersListError({ users: state })).toBeNull();
  });

  it('limpa apenas o erro da API depois que o snackbar fecha', () => {
    expect(reducer({
      list: {
        items: [user],
        pagination: null,
        filters: {},
        page: 1,
        pageSize: 10,
        status: 'failed',
        error: { message: 'Falha' },
      },
      selected: user,
      mutation: { operation: null, status: 'idle', error: null },
      download: { status: 'idle', error: null, filename: null },
    }, clearUsersError())).toEqual({
      list: {
        items: [user],
        pagination: null,
        filters: {},
        page: 1,
        pageSize: 10,
        status: 'idle',
        error: null,
      },
      selected: user,
      mutation: { operation: null, status: 'idle', error: null },
      download: { status: 'idle', error: null, filename: null },
    });
  });
});

describe('usersSlice — separação entre list, mutation e download', () => {
  const listError = { message: 'Erro na listagem' };
  const mutationError = { message: 'Erro no cadastro', fieldErrors: { email: 'x' } };
  const downloadError = { message: 'Erro no download' };

  it('createX.pending escreve em mutation e não toca list', () => {
    const afterGet = reducer(undefined, fulfilledAction(getUsers, {
      items: [user],
      pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
    }));
    const afterCreatePending = reducer(afterGet, pendingAction(createAdministrator));

    expect(afterCreatePending.list.status).toBe('succeeded');
    expect(afterCreatePending.list.items).toEqual([user]);
    expect(afterCreatePending.mutation).toEqual({
      operation: 'create',
      status: 'pending',
      error: null,
    });
  });

  it('createX.rejected escreve em mutation e não toca list.error nem list.status', () => {
    const afterListReject = reducer(undefined, rejectedAction(getUsers, listError));
    const afterCreateReject = reducer(
      afterListReject,
      rejectedAction(createResearcher, mutationError),
    );

    expect(afterCreateReject.list.status).toBe('failed');
    expect(afterCreateReject.list.error).toEqual(listError);
    expect(afterCreateReject.mutation.status).toBe('failed');
    expect(afterCreateReject.mutation.error).toEqual(mutationError);
  });

  it('getUsers.pending escreve em list e não toca mutation', () => {
    const afterCreateReject = reducer(undefined, rejectedAction(createAdministrator, mutationError));
    const afterGetPending = reducer(afterCreateReject, pendingAction(getUsers));

    expect(afterGetPending.mutation.status).toBe('failed');
    expect(afterGetPending.mutation.error).toEqual(mutationError);
    expect(afterGetPending.list.status).toBe('pending');
    expect(afterGetPending.list.error).toBeNull();
  });

  it('getUsers.rejected escreve em list e não toca mutation.error', () => {
    const afterCreateReject = reducer(undefined, rejectedAction(createAdministrator, mutationError));
    const afterGetReject = reducer(afterCreateReject, rejectedAction(getUsers, listError));

    expect(afterGetReject.mutation.error).toEqual(mutationError);
    expect(afterGetReject.mutation.status).toBe('failed');
    expect(afterGetReject.list.error).toEqual(listError);
    expect(afterGetReject.list.status).toBe('failed');
  });

  it('download.pending escreve só em download', () => {
    const afterListAndCreate = reducer(
      reducer(undefined, rejectedAction(getUsers, listError)),
      rejectedAction(createAdministrator, mutationError),
    );
    const afterDownloadPending = reducer(afterListAndCreate, pendingAction(downloadUserCoepDocument, 7));

    expect(afterDownloadPending.list.error).toEqual(listError);
    expect(afterDownloadPending.mutation.error).toEqual(mutationError);
    expect(afterDownloadPending.download).toEqual({
      status: 'pending',
      error: null,
      filename: null,
    });
  });

  it('download.rejected escreve só em download', () => {
    const afterDownloadReject = reducer(
      undefined,
      rejectedAction(downloadUserCoepDocument, downloadError),
    );

    expect(afterDownloadReject.download.status).toBe('failed');
    expect(afterDownloadReject.download.error).toEqual(downloadError);
    expect(afterDownloadReject.list.status).toBe('idle');
    expect(afterDownloadReject.list.error).toBeNull();
    expect(afterDownloadReject.mutation.status).toBe('idle');
    expect(afterDownloadReject.mutation.error).toBeNull();
  });

  it.each([
    ['createUser', createUser],
    ['createResearcher', createResearcher],
    ['createAdministrator', createAdministrator],
    ['createAuditor', createAuditor],
    ['createCommitteeMember', createCommitteeMember],
  ])('%s.pending seta mutation.operation = "create"', (_name, thunk) => {
    const state = reducer(undefined, pendingAction(thunk));

    expect(state.mutation.operation).toBe('create');
    expect(state.mutation.status).toBe('pending');
    expect(state.list.status).toBe('idle');
  });
});

describe('usersSlice — clearUsersListError / clearUsersMutationError', () => {
  const listError = { message: 'Erro na listagem' };
  const mutationError = { message: 'Erro no cadastro' };

  it('clearUsersListError limpa list.error mas preserva mutation.error', () => {
    const withBothErrors = reducer(
      reducer(undefined, rejectedAction(getUsers, listError)),
      rejectedAction(createAdministrator, mutationError),
    );

    const after = reducer(withBothErrors, clearUsersListError());

    expect(after.list.error).toBeNull();
    expect(after.list.status).toBe('idle');
    expect(after.mutation.error).toEqual(mutationError);
    expect(after.mutation.status).toBe('failed');
  });

  it('clearUsersMutationError limpa mutation.error mas preserva list.error', () => {
    const withBothErrors = reducer(
      reducer(undefined, rejectedAction(getUsers, listError)),
      rejectedAction(createAdministrator, mutationError),
    );

    const after = reducer(withBothErrors, clearUsersMutationError());

    expect(after.mutation.error).toBeNull();
    expect(after.mutation.status).toBe('idle');
    expect(after.list.error).toEqual(listError);
    expect(after.list.status).toBe('failed');
  });
});
