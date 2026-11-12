import React, { useEffect, useState } from 'react';
import { Listing, Filter, Button, StatusChip, Snackbar, TableColumn, StatusChipStatus, type AutocompleteOption } from "@niar/ui";
import { selectAuthSelected } from '../../store/auth/auth.selectors';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setUsersFilters,
  clearUsersFilters,
  setUsersPage,
  setUsersPageSize,
  clearUsersError,
  setSelectedUser,
  clearSelectedUser,
  clearUsersMutationError,
  clearUsersDownloadError,
} from "../../store/users/users.slice";
import {
  selectUsersList,
  selectUsersSelected,
  selectUsersMutationLoading,
  selectUsersMutationError,
  selectUsersDownloadLoading,
  selectUsersDownloadError,
  selectUsersListFilters,
  selectUsersListPagination,
  selectUsersListPage,
  selectUsersListPageSize,
  selectUsersListLoading,
  selectUsersListError,
} from "../../store/users/users.selectors";
import {
  createUserAuthEvaluation,
  downloadUserCoepDocument,
  getUsers,
  updateUserStatus,
} from '../../store/users/users.api';
import { useApiError } from "../../hooks/use-api-error/use-api-error"
import { UserListItem, UserRole } from '../../types/user.types';
import { UserAccountStatus } from '@niar/contracts';
import {
  USER_LIST_CONFIG,
  USER_DETAILS_CONFIG,
  type UserColumnId,
  type UserFilterKey,
  type UserActionId,
} from './Users.roles';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import {
  UserEvaluationDialog,
  type UserEvaluationDecision,
} from '../../components/UserEvaluationDialog/UserEvaluationDialog';
import { UserDetailsDialog } from '../../components/UserDetailsDialog';
import './Users.scss';

const toTableColumns = (cols: TableColumn<UserListItem>[]) =>
  cols as unknown as TableColumn<Record<string, unknown>>[];

const toTableRows = (rows: UserListItem[]) =>
  rows as unknown as Record<string, unknown>[];

const roleOptions: readonly AutocompleteOption[] = [
  { value: "researcher", label: "Pesquisador" },
  { value: "admin", label: "Administrador" },
  { value: "auditor", label: "Auditor" },
  { value: "committee", label: "Comitê" }
];

const statusOptions: readonly AutocompleteOption[] = [
  { value: "pending", label: "Pendente" },
  { value: "active", label: "Ativo" },
  { value: "rejected", label: "Rejeitado" },
  { value: "disabled", label: "Desativado" },
];

const STATUS_CHIP_MAP: Record<UserAccountStatus, StatusChipStatus> = {
  pending: "warning",
  active: "success",
  rejected: "error",
  disabled: "default",
};

export function Users() {
  const dispatch = useAppDispatch();
  const [operation, setOperation] = useState<'evaluate' | 'active' | 'disabled' | null>(null);
  const mutationLoading = useAppSelector(selectUsersMutationLoading);
  const mutationError = useAppSelector(selectUsersMutationError);
  const downloadLoading = useAppSelector(selectUsersDownloadLoading);
  const downloadError = useAppSelector(selectUsersDownloadError);
  const user = useAppSelector(selectAuthSelected);
  const users = useAppSelector(selectUsersList);
  const selectedUser = useAppSelector(selectUsersSelected);
  const detailsConfig = selectedUser ? USER_DETAILS_CONFIG[selectedUser.role] : undefined;

  const filters = useAppSelector(selectUsersListFilters);
  const pagination = useAppSelector(selectUsersListPagination);
  const page = useAppSelector(selectUsersListPage);
  const pageSize = useAppSelector(selectUsersListPageSize);
  const loading = useAppSelector(selectUsersListLoading);
  const error = useAppSelector(selectUsersListError);
  const roleConfig =
    USER_LIST_CONFIG[user?.role ?? "admin"] ?? USER_LIST_CONFIG.admin!;

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getUsers({
      page,
      pageSize,
      search: filters.search,
      role: filters.role,
      accountStatus: filters.accountStatus,
    }));
  }, [dispatch, page, pageSize, filters.search, filters.role, filters.accountStatus]);

  useEffect(() => () => {
    dispatch(clearSelectedUser());
  }, [dispatch]);

  const handleFiltersChange = (values: {
    search?: AutocompleteOption | string | null;
    role?: { value: UserRole; label: string } | null;
    accountStatus?: { value: UserAccountStatus; label: string } | null;
  }) => {
    const search = values.search;
    const searchValue = typeof search === "string"
      ? search.trim() || undefined
      : search?.value.trim() || undefined;

    dispatch(
      setUsersFilters({
        search: searchValue,
        role: values.role?.value ?? undefined,
        accountStatus: values.accountStatus?.value ?? undefined,
      }),
    );
  };

  const handleClearFilters = () => {
    dispatch(clearUsersFilters());
  };

  const handlePageChange = (_event: unknown, nextPage: number) => {
    dispatch(setUsersPage(nextPage + 1)); // UI=0-based, API=1-based
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setUsersPageSize(Number(event.target.value)));
  };

  const closeOperation = () => {
    if (mutationLoading) return;
    setOperation(null);
    dispatch(clearSelectedUser());
    dispatch(clearUsersError());
  };

  const openOperation = (target: UserListItem, next: 'evaluate' | 'active' | 'disabled') => {
    dispatch(clearUsersError());
    dispatch(setSelectedUser(target));
    setOperation(next);
  };

  const refreshUsers = () => dispatch(getUsers({ page, pageSize, ...filters }));
  const confirmStatus = async () => {
    if (!selectedUser || mutationLoading || (operation !== 'active' && operation !== 'disabled')) return;
    const result = await dispatch(updateUserStatus({ userId: selectedUser.id, status: operation }));
    if (updateUserStatus.fulfilled.match(result)) {
      setOperation(null);
      dispatch(clearSelectedUser());
      void refreshUsers();
    }
  };

  const submitEvaluation = async (
    decision: UserEvaluationDecision,
    justification?: string,
  ) => {
    if (!selectedUser) return;

    const result = await dispatch(createUserAuthEvaluation({
      userId: selectedUser.id,
      status: decision,
      justification,
    }));

    if (createUserAuthEvaluation.fulfilled.match(result)) {
      setOperation(null);
      dispatch(clearSelectedUser());
      setSuccessMessage('Avaliação registrada com sucesso.');
      void refreshUsers();
    }
  };

  const selectedRole = roleOptions.find((opt) => opt.value === filters.role) ?? null;
  const selectedStatus = statusOptions.find((opt) => opt.value === filters.accountStatus) ?? null;
  // A busca é livre e deve alcançar usuários que não estejam na página atual.
  // Não usamos os itens paginados como opções do autocomplete, pois isso faria
  // a lista de sugestões representar somente a página carregada.
  const searchOptions: readonly AutocompleteOption[] = [];
  const selectedSearch = filters.search ?? null;

  const columnDefinitions: Record<UserColumnId, TableColumn<UserListItem>> = {
    fullName: { key: "fullName", label: "Nome" },
    email: { key: "email", label: "E-mail" },
    role: {
      key: "role",
      label: "Perfil",
      render: (_value, user) =>
        roleOptions.find((opt) => opt.value === user.role)?.label ?? user.role,
    },
    accountStatus: {
      key: "accountStatus",
      label: "Status",
      render: (_value: unknown, user: UserListItem) =>
        <StatusChip
            status={STATUS_CHIP_MAP[user.accountStatus]}
            label={statusOptions.find((opt) => opt.value === user.accountStatus)?.label ?? user.accountStatus}
        />
    },
    actions: {
      variant: "actions",
      label: "Ações",
      render: (_value: unknown, user: UserListItem) => (
        <>
          {roleConfig.actions.map((actionId) => (
            <React.Fragment key={actionId}>
              {actionDefinitions[actionId](user)}
            </React.Fragment>
          ))}

        </>
      ),
    },
  };

  const columns = roleConfig.columnIds.map((columnId) => columnDefinitions[columnId]);

  const filterDefinitions: Record<UserFilterKey, readonly AutocompleteOption[]> = {
    search: searchOptions,
    role: roleOptions,
    accountStatus: statusOptions,
  };

  const filterValues: Record<UserFilterKey, AutocompleteOption | string | null> = {
    search: selectedSearch,
    role: selectedRole,
    accountStatus: selectedStatus,
  };

  const actionDefinitions: Record<
    UserActionId,
    (user: UserListItem) => React.ReactNode | null
  > = {
    details: (user) => (
      <Button
        size="small"
        variant="outlined"
        color="primary"
        onClick={() => dispatch(setSelectedUser(user))}
      >
        Detalhes
      </Button>
    ),
    evaluate: (user) => user.role === "researcher" && user.accountStatus === "pending" ? (
      <Button size="small" variant="outlined" color="primary" disabled={mutationLoading} onClick={() => openOperation(user, 'evaluate')}>
        Avaliar
      </Button>
    ) : null,
    deactivate: (target) => target.accountStatus === "active" && target.id !== user?.id ? (
      <Button size="small" variant="outlined" color="danger" disabled={mutationLoading} onClick={() => openOperation(target, 'disabled')}>
        Desativar
      </Button>
    ) : null,
    activate: (user) => user.accountStatus === "disabled" ? (
      <Button size="small" variant="outlined" color="primary" disabled={mutationLoading} onClick={() => openOperation(user, 'active')}>
        Ativar
      </Button>
    ) : null,
  };

  const paginationProps = {
    labelRowsPerPage: 'Linhas por página',
    labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) => `${from}–${to} de ${count}`,
    getItemAriaLabel: (type: 'first' | 'last' | 'next' | 'previous') => ({ first: 'Primeira página', last: 'Última página', next: 'Próxima página', previous: 'Página anterior' })[type],
    count: pagination?.totalItems ?? 0,
    page: page - 1,                             // API=1-based → UI=0-based
    rowsPerPage: pageSize,
    rowsPerPageOptions: [10, 20, 50, 100],
    onPageChange: handlePageChange,
    onRowsPerPageChange: handlePageSizeChange,
  };

  const hasActiveFilters = roleConfig.filters.some((key) => Boolean(filters[key]));

  const emptyStateProps = hasActiveFilters
    ? {
        title: "Nenhum usuário encontrado",
        description: "Não encontramos usuários com os filtros selecionados.",
        action: (
          <Button variant="text" onClick={handleClearFilters}>
            Limpar filtros
          </Button>
        ),
      }
    : {
        title: "Nenhum usuário cadastrado",
        description: roleConfig.emptyStateDescription,
      };

  const pageError = mutationError ?? downloadError ?? error;
  const pageErrorFallback = mutationError
    ? "Não foi possível concluir a operação do usuário. Tente novamente."
    : downloadError
      ? "Não foi possível baixar o parecer do COEP. Tente novamente."
      : "Não foi possível carregar os usuários. Tente novamente.";
  const pageErrorSnackbar = useApiError(
    pageError,
    () => {
      if (mutationError) {
        dispatch(clearUsersMutationError());
      } else if (downloadError) {
        dispatch(clearUsersDownloadError());
      } else {
        dispatch(clearUsersError());
      }
    },
    pageErrorFallback,
  );
  const snackbarProps = pageError
    ? pageErrorSnackbar
    : {
        ...pageErrorSnackbar,
        open: Boolean(successMessage),
        message: successMessage ?? '',
        severity: 'success' as const,
        onClose: () => setSuccessMessage(null),
      };

  return (
    <>
      <div className="users-page">
        <Listing
          title={roleConfig.title}
          description={roleConfig.description}
          action={roleConfig.canCreateUser ? (
            <Button
              variant="contained"
              color="primary"
              href="/admin/administrador/usuarios/novo"
            >
              Cadastrar usuário
            </Button>
          ) : undefined}
          separateFilter
          tableSize="small"
          columns={toTableColumns(columns)}
          rows={toTableRows(users)}
          loading={loading}
          pagination={paginationProps}
          emptyState={emptyStateProps}
          filter={
            <section className="users-page__filters" aria-label="Filtros de usuários">
              <h2>Filtros</h2>
              <Filter
                search={roleConfig.filters.map((key) => ({
                  key,
                  label: roleConfig.filterLabels?.[key] ?? key,
                  options: filterDefinitions[key],
                  ...(key === "search" ? { freeSolo: true } : {}),
                }))}
                values={filterValues}
                onChange={handleFiltersChange}
              />
            </section>
          }
        />
      </div>
      <UserDetailsDialog
        open={Boolean(selectedUser) && !operation}
        user={selectedUser}
        config={detailsConfig}
        onClose={() => dispatch(clearSelectedUser())}
      />
      <ConfirmationDialog
        open={Boolean(selectedUser) && (operation === 'active' || operation === 'disabled')}
        title={operation === 'active' ? 'Ativar usuário' : 'Desativar usuário'}
        confirmLabel={operation === 'active' ? 'Ativar' : 'Desativar'}
        onClose={closeOperation}
        onConfirm={() => { void confirmStatus(); }}
        loading={mutationLoading}
      >
        Deseja {operation === 'active' ? 'ativar' : 'desativar'} o usuário “{selectedUser?.fullName}”?
      </ConfirmationDialog>
      {operation === 'evaluate' && selectedUser ? (
        <UserEvaluationDialog
          open
          user={selectedUser}
          loading={mutationLoading}
          downloadLoading={downloadLoading}
          onClose={closeOperation}
          onDownloadCoep={() => { void dispatch(downloadUserCoepDocument(selectedUser.id)); }}
          onSubmit={submitEvaluation}
        />
      ) : null}
      <Snackbar {...snackbarProps} />
    </>
  );
};
