import {
  Button,
  Filter,
  Listing,
  Snackbar,
  StatusChip,
  type AutocompleteOption,
  type TableColumn,
} from '@niar/ui';
import { useEffect, type ChangeEvent } from 'react';
import { useApiError } from '../../hooks/use-api-error/use-api-error';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchSpecialties } from '../../store/specialties/specialties.api';
import {
  selectSpecialties,
  selectSpecialtiesError,
  selectSpecialtiesFilters,
  selectSpecialtiesLoading,
  selectSpecialtiesPage,
  selectSpecialtiesPageSize,
  selectSpecialtiesPagination,
} from '../../store/specialties/specialties.selectors';
import {
  clearSpecialtiesError,
  clearSpecialtiesFilters,
  setSpecialtiesFilters,
  setSpecialtiesPage,
  setSpecialtiesPageSize,
} from '../../store/specialties/specialties.slice';
import type { SpecialtiesFilters } from '../../types/specialty.types';

const STATUS_OPTIONS: readonly AutocompleteOption[] = [
  { label: 'Ativa', value: 'true' },
  { label: 'Inativa', value: 'false' },
];

type SpecialtyRow = {
  id: number;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  actions: null;
};

const columns: readonly TableColumn<SpecialtyRow>[] = [
  { key: 'name', label: 'Nome' },
  { key: 'code', label: 'Código' },
  { key: 'description', label: 'Descrição' },
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
  {
    key: 'actions',
    label: 'Ações',
    render: (_, row) => (
      <>
        <Button type="button" variant="outlined" size="small">
          Editar
        </Button>
        <Button
          type="button"
          variant="outlined"
          color={row.isActive ? 'danger' : 'primary'}
          size="small"
        >
          {row.isActive ? 'Desativar' : 'Ativar'}
        </Button>
      </>
    ),
  },
];

const autocompleteValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value.trim() || undefined;
  if (typeof value === 'object' && value !== null && 'value' in value && typeof value.value === 'string') {
    return value.value.trim() || undefined;
  }
  return undefined;
};

const statusOptionFor = (isActive: boolean | undefined) => {
  if (isActive === undefined) return null;
  return STATUS_OPTIONS.find(({ value }) => value === String(isActive)) ?? null;
};

export function Specialties() {
  const dispatch = useAppDispatch();
  const specialties = useAppSelector(selectSpecialties);
  const pagination = useAppSelector(selectSpecialtiesPagination);
  const filters = useAppSelector(selectSpecialtiesFilters);
  const page = useAppSelector(selectSpecialtiesPage);
  const pageSize = useAppSelector(selectSpecialtiesPageSize);
  const loading = useAppSelector(selectSpecialtiesLoading);
  const error = useAppSelector(selectSpecialtiesError);

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

  const rows: SpecialtyRow[] = specialties.map((specialty) => ({
    id: specialty.id,
    name: specialty.name,
    code: specialty.code,
    description: specialty.description,
    isActive: specialty.isActive,
    actions: null,
  }));

  const searchOptions = Array.from(new Set(
    specialties.flatMap(({ code, name }) => [code, name]),
  ));

  const handleFilterChange = (values: Readonly<Record<string, unknown>>) => {
    const query = autocompleteValue(values.query);
    const status = autocompleteValue(values.isActive);
    const nextFilters: SpecialtiesFilters = {
      ...(query ? { query } : {}),
      ...(status === 'true' ? { isActive: true } : status === 'false' ? { isActive: false } : {}),
    };

    dispatch(setSpecialtiesFilters(nextFilters));
  };

  const hasActiveFilters = Boolean(filters.query) || filters.isActive !== undefined;
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
      };

  return (
    <>
      <Listing
        title="Especialidades"
        description="Consulte as especialidades cadastradas na plataforma."
        aria-label="Lista de especialidades"
        emptyStateAriaLabel="Lista de especialidades vazia"
        filter={(
          <Filter
            aria-label="Filtros de especialidades"
            search={[
              { key: 'query', label: 'Buscar especialidade', options: searchOptions },
              { key: 'isActive', label: 'Status', options: STATUS_OPTIONS },
            ]}
            values={{
              query: filters.query ?? null,
              isActive: statusOptionFor(filters.isActive),
            }}
            onChange={handleFilterChange}
          />
        )}
        columns={columns}
        rows={rows}
        loading={loading || Boolean(error && rows.length === 0)}
        pagination={{
          count: pagination?.totalItems ?? 0,
          page: (pagination?.page ?? 1) - 1,
          rowsPerPage: pagination?.pageSize ?? pageSize,
          rowsPerPageOptions: [5, 10, 20, 50],
          onPageChange: (_event: unknown, nextPage: number) => {
            dispatch(setSpecialtiesPage(nextPage + 1));
          },
          onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => {
            dispatch(setSpecialtiesPageSize(Number(event.target.value)));
          },
        }}
        emptyState={emptyState}
      />
      {error ? (
        <Button type="button" variant="text" size="small" onClick={() => { void loadSpecialties(); }}>
          Tentar novamente
        </Button>
      ) : null}
      <Snackbar {...apiErrorSnackbar} />
    </>
  );
}
