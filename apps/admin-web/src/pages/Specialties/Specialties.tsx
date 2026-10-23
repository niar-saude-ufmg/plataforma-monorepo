import {
  Button,
  Dialog,
  Filter,
  Listing,
  Snackbar,
  StatusChip,
  type TableColumn,
} from '@niar/ui';
import { useEffect, useState, type ChangeEvent } from 'react';
import { SpecialtyForm, type SpecialtyFormValues } from '../../components/SpecialtyForm';
import { useApiError } from '../../hooks/use-api-error/use-api-error';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createSpecialty, fetchSpecialties, updateSpecialty, updateSpecialtyStatus } from '../../store/specialties/specialties.api';
import {
  selectSpecialtiesList,
  selectSpecialtiesListError,
  selectSpecialtiesListFilters,
  selectSpecialtiesListLoading,
  selectSpecialtiesListPage,
  selectSpecialtiesListPageSize,
  selectSpecialtiesListPagination,
  selectSpecialtiesMutationError,
  selectSpecialtiesMutationLoading,
  selectSpecialtiesSelected,
} from '../../store/specialties/specialties.selectors';
import {
  clearSelectedSpecialty,
  clearSpecialtiesError,
  clearSpecialtiesFilters,
  clearSpecialtiesMutation,
  setSelectedSpecialty,
  setSpecialtiesFilters,
  setSpecialtiesPage,
  setSpecialtiesPageSize,
} from '../../store/specialties/specialties.slice';
import type { Specialty, SpecialtyListFilters } from '../../types/specialty.types';
import './Specialties.scss';

const STATUS_OPTIONS = [
  { label: 'Todas', value: 'all' },
  { label: 'Ativas', value: 'true' },
  { label: 'Inativas', value: 'false' },
] as const;

type SpecialtyRow = Specialty;

const autocompleteValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value.trim() || undefined;
  if (typeof value === 'object' && value !== null && 'value' in value && typeof value.value === 'string') {
    return value.value.trim() || undefined;
  }
  return undefined;
};

export function Specialties() {
  const dispatch = useAppDispatch();
  const specialties = useAppSelector(selectSpecialtiesList);
  const pagination = useAppSelector(selectSpecialtiesListPagination);
  const filters = useAppSelector(selectSpecialtiesListFilters);
  const page = useAppSelector(selectSpecialtiesListPage);
  const pageSize = useAppSelector(selectSpecialtiesListPageSize);
  const loading = useAppSelector(selectSpecialtiesListLoading);
  const error = useAppSelector(selectSpecialtiesListError);
  const selected = useAppSelector(selectSpecialtiesSelected);
  const mutationLoading = useAppSelector(selectSpecialtiesMutationLoading);
  const mutationError = useAppSelector(selectSpecialtiesMutationError);
  const [mode, setMode] = useState<'create' | 'edit' | null>(null);
  const [statusTarget, setStatusTarget] = useState<Specialty | null>(null);

  const closeForm = () => {
    if (mutationLoading) return;
    setMode(null);
    dispatch(clearSelectedSpecialty());
    dispatch(clearSpecialtiesMutation());
  };

  const openForm = (nextMode: 'create' | 'edit', specialty?: Specialty) => {
    dispatch(clearSpecialtiesMutation());
    if (specialty) dispatch(setSelectedSpecialty(specialty));
    else dispatch(clearSelectedSpecialty());
    setMode(nextMode);
  };

  const openStatusConfirmation = (specialty: Specialty) => {
    dispatch(clearSpecialtiesMutation());
    setStatusTarget(specialty);
  };

  const closeStatusConfirmation = () => {
    if (mutationLoading) return;
    setStatusTarget(null);
    dispatch(clearSelectedSpecialty());
    dispatch(clearSpecialtiesMutation());
  };

  const submit = async ({ code, ...values }: SpecialtyFormValues) => {
    if (mutationLoading) return;
    const result = mode === 'edit' && selected
      ? await dispatch(updateSpecialty({ id: selected.id, ...values }))
      : await dispatch(createSpecialty({ code, ...values }));
    if (createSpecialty.fulfilled.match(result) || updateSpecialty.fulfilled.match(result)) closeForm();
  };

  const confirmStatus = async () => {
    if (!statusTarget || mutationLoading) return;
    const result = await dispatch(updateSpecialtyStatus({ id: statusTarget.id, isActive: !statusTarget.isActive }));
    if (updateSpecialtyStatus.fulfilled.match(result)) closeStatusConfirmation();
  };

  const mutationSnackbar = useApiError(
    mutationError,
    () => dispatch(clearSpecialtiesMutation()),
    'Não foi possível concluir a operação. Tente novamente.',
  );

  const loadSpecialties = () => dispatch(fetchSpecialties({
    page,
    pageSize,
    query: filters.query || undefined,
    isActive: filters.isActive,
  }));

  useEffect(() => {
    void loadSpecialties();
  }, [dispatch, filters.query, filters.isActive, page, pageSize]);

  const apiErrorSnackbar = useApiError(
    error,
    () => dispatch(clearSpecialtiesError()),
    'Não foi possível carregar as especialidades. Tente novamente.',
  );

  const rows: SpecialtyRow[] = specialties;

  const searchOptions = specialties.map(({ code, name }) => ({
    label: `${code} - ${name}`,
    value: code,
  }));

  const handleFilterChange = (values: Readonly<Record<string, unknown>>) => {
    const query = autocompleteValue(values.query);
    const status = typeof values.isActive === 'string' ? values.isActive : undefined;
    const nextFilters: SpecialtyListFilters = {
      ...(query ? { query } : {}),
      ...(status === 'true' ? { isActive: true } : status === 'false' ? { isActive: false } : {}),
    };

    dispatch(setSpecialtiesFilters(nextFilters));
  };

  const hasActiveFilters = Boolean(filters.query) || filters.isActive !== undefined;
  const createAction = (
    <Button type="button" variant="contained" disabled={mutationLoading} onClick={() => openForm('create')}>
      Cadastrar especialidade
    </Button>
  );
  const emptyState = hasActiveFilters
    ? {
        title: 'Nenhuma especialidade encontrada',
        description: 'Não encontramos especialidades com os filtros selecionados.',
        action: (
          <Button type="button" variant="text" onClick={() => dispatch(clearSpecialtiesFilters())}>
            Limpar filtros
          </Button>
        ),
      }
    : {
        title: 'Nenhuma especialidade cadastrada',
        description: 'Ainda não existem especialidades para exibir.',
        action: createAction,
      };

  const columns: readonly TableColumn<SpecialtyRow>[] = [
    { key: 'code', label: 'Código' },
    { key: 'name', label: 'Especialidade' },
    {
      key: 'isActive',
      label: 'Status',
      render: (_, row) => (
        <StatusChip
          label={row.isActive ? 'Ativa' : 'Inativa'}
          status={row.isActive ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    { key: 'description', label: 'Descrição' },
    {
      label: 'Ações',
      variant: 'actions',
      render: (_, row) => (
        <div className="specialties-row-actions">
          <Button type="button" variant="outlined" size="small" disabled={mutationLoading} onClick={() => openForm('edit', row)}>
            Editar
          </Button>
          <Button
            type="button"
            variant="outlined"
            color={row.isActive ? 'danger' : 'primary'}
            size="small"
            disabled={mutationLoading}
            onClick={() => openStatusConfirmation(row)}
          >
            {row.isActive ? 'Desativar' : 'Ativar'}
          </Button>
        </div>
      ),
    },
  ];

  const paginationProps = {
    labelRowsPerPage: 'Linhas por página',
    labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) => `${from}–${to} de ${count}`,
    getItemAriaLabel: (type: 'first' | 'last' | 'next' | 'previous') => ({
      first: 'Primeira página',
      last: 'Última página',
      next: 'Próxima página',
      previous: 'Página anterior',
    })[type],
    count: pagination?.totalItems ?? 0,
    page: (pagination?.page ?? 1) - 1,
    rowsPerPage: pagination?.pageSize ?? pageSize,
    rowsPerPageOptions: [10, 20, 50, 100],
    onPageChange: (_event: unknown, nextPage: number) => {
      dispatch(setSpecialtiesPage(nextPage + 1));
    },
    onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(setSpecialtiesPageSize(Number(event.target.value)));
    },
  };

  if (mode) {
    return (
      <div className="specialties-form-page">
        <SpecialtyForm mode={mode} initialValues={selected ?? undefined} onSubmit={submit} onCancel={closeForm} />
        <Snackbar {...mutationSnackbar} />
      </div>
    );
  }

  return (
    <div className="specialties-page">
      <Listing
        action={createAction}
        title="Especialidades"
        description="Gerencie o catálogo de especialidades da plataforma."
        aria-label="Lista de especialidades"
        emptyStateAriaLabel="Lista de especialidades vazia"
        filter={(
          <Filter
            aria-label="Filtros de especialidades"
            search={[{ key: 'query', label: 'Buscar especialidade', options: searchOptions, freeSolo: true }]}
            checkedOptions={[{
              key: 'isActive',
              label: 'Status',
              type: 'radio',
              row: true,
              options: STATUS_OPTIONS,
            }]}
            values={{
              query: filters.query ?? null,
              isActive: filters.isActive === undefined ? 'all' : String(filters.isActive),
            }}
            onChange={handleFilterChange}
          />
        )}
        columns={columns}
        rows={rows}
        loading={loading || Boolean(error && rows.length === 0)}
        pagination={paginationProps}
        emptyState={emptyState}
      />
      {error ? (
        <Button type="button" variant="text" size="small" onClick={() => { void loadSpecialties(); }}>
          Tentar novamente
        </Button>
      ) : null}
      <Dialog
        open={Boolean(statusTarget)}
        title={statusTarget?.isActive ? 'Desativar especialidade' : 'Ativar especialidade'}
        aria-label="Confirmar alteração de status"
        onClose={closeStatusConfirmation}
        showCloseButton={!mutationLoading}
        actions={(
          <>
            <Button type="button" variant="text" disabled={mutationLoading} onClick={closeStatusConfirmation}>
              Cancelar
            </Button>
            <Button type="button" variant="contained" disabled={mutationLoading} onClick={() => { void confirmStatus(); }}>
              {mutationLoading ? 'Salvando…' : statusTarget?.isActive ? 'Desativar' : 'Ativar'}
            </Button>
          </>
        )}
      >
        <Snackbar {...mutationSnackbar} />
        Deseja {statusTarget?.isActive ? 'desativar' : 'ativar'} a especialidade “{statusTarget?.name}”?
      </Dialog>
      <Snackbar {...apiErrorSnackbar} />
    </div>
  );
}
