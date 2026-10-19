import React, { useEffect } from 'react';
import { Listing, Filter, Button, StatusChip, Snackbar, TableColumn, StatusChipStatus } from "@niar/ui";
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setUsersFilters,
  clearUsersFilters,
  setUsersPage,
  setUsersPageSize,
  clearUsersError,
} from "../../store/users/users.slice";
import {
  selectUsers,
  selectUsersFilters,
  selectUsersPagination,
  selectUsersPage,
  selectUsersPageSize,
  selectUsersLoading,
  selectUsersError,
} from "../../store/users/users.selectors";
import { getUsers } from '../../store/users/users.api';
import { useApiError } from "../../hooks/use-api-error/use-api-error"
import { UserListItem, UserRole } from '../../types/user.types';
import { UserAccountStatus } from '@niar/contracts';

const toTableColumns = (cols: TableColumn<UserListItem>[]) =>
  cols as unknown as TableColumn<Record<string, unknown>>[];

const toTableRows = (rows: UserListItem[]) =>
  rows as unknown as Record<string, unknown>[];

export function Users() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const filters = useAppSelector(selectUsersFilters);
  const pagination = useAppSelector(selectUsersPagination);
  const page = useAppSelector(selectUsersPage);
  const pageSize = useAppSelector(selectUsersPageSize);
  const loading = useAppSelector(selectUsersLoading);
  const error = useAppSelector(selectUsersError);

  useEffect(() => {
    dispatch(getUsers({
      page,
      pageSize,
      role: filters.role,
      accountStatus: filters.accountStatus,
    }));
  }, [dispatch, page, pageSize, filters.role, filters.accountStatus]);

  const handleFiltersChange = (values: {
    role?: { value: UserRole; label: string } | null;
    accountStatus?: { value: UserAccountStatus; label: string } | null;
  }) => {
    dispatch(
      setUsersFilters({
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

  const roleOptions = [
    { value: "researcher", label: "Pesquisador" },
    { value: "admin", label: "Administrador" },
    { value: "committee", label: "Comitê" },
  ];

  const statusOptions = [
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

  const selectedRole = roleOptions.find((opt) => opt.value === filters.role) ?? null;
  const selectedStatus = statusOptions.find((opt) => opt.value === filters.accountStatus) ?? null;

  const columns : TableColumn<UserListItem>[] = [
    { key: "fullName", label: "Nome" },
    { key: "email", label: "E-mail" },
    {
      key: "role",
      label: "Perfil",
      render: (_value, user) =>
        roleOptions.find((opt) => opt.value === user.role)?.label ?? user.role,
    },
    {
      key: "accountStatus",
      label: "Status",
      render: (_value: unknown, user: UserListItem) =>
        <StatusChip
            status={STATUS_CHIP_MAP[user.accountStatus]}
            label={statusOptions.find((opt) => opt.value === user.accountStatus)?.label ?? user.accountStatus}
        />
    },
    {
      label: "Ações",
      variant: "actions",
      render: (_value: unknown, user: UserListItem) => (
        <>
          <Button size="small" variant="outlined" color="primary">Detalhes</Button>

          {/* Esses botões serão incluidos nas próximas versões.
          {user.role === "researcher" && (
            <Button size="small" variant="outlined" color="primary">Avaliar</Button>
          )}

          {user.accountStatus === "active" && (
            <Button size="small" variant="outlined" color="danger">Desativar</Button>
          )}

          {(user.accountStatus === "pending" || user.accountStatus === "disabled") && (
            <Button size="small" variant="outlined" color="primary">Ativar</Button>
          )}
          */}

        </>
      ),
    },
  ];

  const paginationProps = {
    count: pagination?.totalItems ?? 0,
    page: page - 1,                             // API=1-based → UI=0-based
    rowsPerPage: pageSize,
    rowsPerPageOptions: [10, 20, 50, 100],
    onPageChange: handlePageChange,
    onRowsPerPageChange: handlePageSizeChange,
  };

  const hasActiveFilters = Boolean(filters.role || filters.accountStatus);

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
        description: "Ainda não existem usuários para exibir.",
      };

  const errorSnackbar = useApiError(
    error,
    () => dispatch(clearUsersError()),
    "Não foi possível carregar os usuários. Tente novamente.",
  );

  return (
    <>
      <Listing
        title="Usuários"
        description="Gerencie os usuários e o status de acesso à plataforma."
        columns={toTableColumns(columns)}
        rows={toTableRows(users)}
        loading={loading}
        pagination={paginationProps}
        emptyState={emptyStateProps}
        filter={
          <Filter
            search={[
              { key: "role", label: "Perfil", options: roleOptions },
              { key: "accountStatus", label: "Status", options: statusOptions },
            ]}
            values={{
              role: selectedRole,
              accountStatus: selectedStatus,
            }}
            onChange={handleFiltersChange}
          />
        }
      />
      <Snackbar {...errorSnackbar} />
    </>
  );
};
