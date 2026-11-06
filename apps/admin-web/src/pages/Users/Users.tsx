import React, { useEffect, useState } from 'react';
import { Listing, Filter, Button, StatusChip, Snackbar, TableColumn, StatusChipStatus, type AutocompleteOption } from "@niar/ui";
import { selectAuthSelected } from '../../store/auth/auth.selectors';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  UserEvaluationDialog,
  type UserEvaluationDecision,
} from '../../components/UserDialogs/UserEvaluationDialog/UserEvaluationDialog';
import { UserStatusDialog } from '../../components/UserDialogs/UserStatusDialog/UserStatusDialog';
import { updateUserStatus, downloadUserCoepDocument } from '../../store/users/users.api';
import {
  setUsersFilters,
  clearUsersFilters,
  setUsersPage,
  setUsersPageSize,
  clearUsersError,
  setSelectedUser,
  clearSelectedUser,
  clearUsersMutationError
} from "../../store/users/users.slice";
import {
  selectUsersList,
  selectUsersListFilters,
  selectUsersListPagination,
  selectUsersListPage,
  selectUsersListPageSize,
  selectUsersListLoading,
  selectUsersListError,
  selectUsersSelected,
  selectUsersMutationError,
  selectUsersMutationLoading,
  selectUsersDownloadLoading,
} from "../../store/users/users.selectors";
import { getUsers } from '../../store/users/users.api';
import { useApiError } from "../../hooks/use-api-error/use-api-error"
import { UserListItem, UserRole } from '../../types/user.types';
import { UserAccountStatus } from '@niar/contracts';
import {
  USER_LIST_CONFIG,
  type UserColumnId,
  type UserFilterKey,
  type UserActionId,
} from './Users.roles';

const toTableColumns = (cols: TableColumn<UserListItem>[]) =>
  cols as unknown as TableColumn<Record<string, unknown>>[];

const toTableRows = (rows: UserListItem[]) =>
  rows as unknown as Record<string, unknown>[];

const roleOptions: readonly AutocompleteOption[] = [
  { value: "researcher", label: "Pesquisador" },
  { value: "admin", label: "Administrador" },
  { value: "auditor", label: "Auditor" },
  { value: "committee", label: "Comitê" },
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
  const user = useAppSelector(selectAuthSelected);
  const users = useAppSelector(selectUsersList);
  const filters = useAppSelector(selectUsersListFilters);
  const pagination = useAppSelector(selectUsersListPagination);
  const page = useAppSelector(selectUsersListPage);
  const pageSize = useAppSelector(selectUsersListPageSize);
  const loading = useAppSelector(selectUsersListLoading);
  const error = useAppSelector(selectUsersListError);
  const selectedUser = useAppSelector(selectUsersSelected);
  const mutationLoading = useAppSelector(selectUsersMutationLoading);
  const mutationError = useAppSelector(selectUsersMutationError);
  const downloadLoading = useAppSelector(selectUsersDownloadLoading);

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

  type UserDialogAction = 'evaluate' | 'activate' | 'deactivate';
  const [activeAction, setActiveAction] = useState<UserDialogAction | null>(null);

  const handleEvaluateClick = (target: UserListItem) => {
    dispatch(clearUsersMutationError());
    dispatch(setSelectedUser(target));
    setActiveAction('evaluate');
  };

  const handleCloseEvaluation = () => {
    setActiveAction(null);
    dispatch(clearSelectedUser());
    dispatch(clearUsersMutationError());
  };

  const handleSubmitEvaluation = async (
    decision: UserEvaluationDecision,
    justification?: string,
  ) => {
    if (!selectedUser) return;

    const result = await dispatch(
      updateUserStatus({
        userId: selectedUser.id,
        status: decision,
        justification,
    }));

    if (updateUserStatus.fulfilled.match(result)) {
      setActiveAction(null);
      dispatch(clearSelectedUser());
      dispatch(clearUsersMutationError());
      setSuccessMessage('Avaliação registrada com sucesso.');
      dispatch(
        getUsers({
          page,
          pageSize,
          search: filters.search,
          role: filters.role,
          accountStatus: filters.accountStatus,
        }),
      );
    }
  };

  const handleDownloadCoep = () => {
    if (selectedUser) {
      dispatch(downloadUserCoepDocument(selectedUser.id));
    }
  };

  const handleActivateClick = (target: UserListItem) => {
    dispatch(clearUsersMutationError());
    dispatch(setSelectedUser(target));
    setActiveAction('activate');
  }

  const handleDeactivateClick = (target: UserListItem) => {
    dispatch(clearUsersMutationError());
    dispatch(setSelectedUser(target));
    setActiveAction('deactivate');
  }

  const handleCloseStatusDialog = () => {
    setActiveAction(null);
    dispatch(clearSelectedUser());
    dispatch(clearUsersMutationError());
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedUser) return;

    const newStatus = activeAction === 'activate' ? 'active' : 'disabled';

    const result = await dispatch(updateUserStatus({
      userId: selectedUser.id,
      status: newStatus,
    }));

    if (updateUserStatus.fulfilled.match(result)) {
      setActiveAction(null);
      dispatch(clearSelectedUser());
      dispatch(clearUsersMutationError());
      setSuccessMessage(`Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`);
      dispatch(
        getUsers({
          page,
          pageSize,
          search: filters.search,
          role: filters.role,
          accountStatus: filters.accountStatus,
        }),
      );
    }
  }

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
    details: () => (
      <Button size="small" variant="outlined" color="primary">
        Detalhes
      </Button>
    ),
    evaluate: (user) => user.role === "researcher" && user.accountStatus === "pending" ? (
      <Button size="small" variant="outlined" color="primary"
        onClick={() => handleEvaluateClick(user)}
      >
        Avaliar
      </Button>
    ) : null,
    deactivate: (user) => user.accountStatus === "active" ? (
      <Button size="small" variant="outlined" color="danger"
        onClick={() => handleDeactivateClick(user)}
      >
        Desativar
      </Button>
    ) : null,
    activate: (user) => user.accountStatus === "disabled" ? (
      <Button size="small" variant="outlined" color="primary"
        onClick={() => handleActivateClick(user)}
      >
        Ativar
      </Button>
    ) : null,
  };

  const paginationProps = {
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

  const errorSnackbar = useApiError(
    error,
    () => dispatch(clearUsersError()),
    "Não foi possível carregar os usuários. Tente novamente.",
  );

  const mutationErrorSnackbar = useApiError(
    mutationError,
    () => dispatch(clearUsersMutationError()),
    "Não foi possível atualizar o status do usuário. Verifique as regras de transição.",
  )

  return (
    <>
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
        columns={toTableColumns(columns)}
        rows={toTableRows(users)}
        loading={loading}
        pagination={paginationProps}
        emptyState={emptyStateProps}
        filter={
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
        }
      />
      <Snackbar {...errorSnackbar} />
      <Snackbar {...mutationErrorSnackbar} />
      <UserEvaluationDialog
        open={activeAction === 'evaluate'}
        user={selectedUser}
        loading={mutationLoading}
        error={mutationError}
        downloadLoading={downloadLoading}
        onDownloadCoep={handleDownloadCoep}
        onClose={handleCloseEvaluation}
        onSubmit={handleSubmitEvaluation}
      />
      <UserStatusDialog
        open={activeAction === 'activate' || activeAction === 'deactivate'}
        user={selectedUser}
        action={activeAction === 'activate' ? 'activate' : 'deactivate'}
        loading={mutationLoading}
        error={mutationError}
        onClose={handleCloseStatusDialog}
        onConfirm={handleConfirmStatusChange}
      />
    </>
  );
};
