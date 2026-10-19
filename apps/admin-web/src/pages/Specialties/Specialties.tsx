import {
  Button,
  Filter,
  Listing,
  Snackbar,
  StatusChip,
  type TableColumn,
} from '@niar/ui';
import { useEffect, type ChangeEvent } from 'react';
import { useApiError } from '../../hooks/use-api-error/use-api-error';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchSpecialties } from '../../store/specialties/specialties.api';
import {
  selectSpecialtiesList,
  selectSpecialtiesListError,
  selectSpecialtiesListFilters,
  selectSpecialtiesListLoading,
  selectSpecialtiesListPage,
  selectSpecialtiesListPageSize,
  selectSpecialtiesListPagination,
} from '../../store/specialties/specialties.selectors';
import {
  clearSpecialtiesError,
  clearSpecialtiesFilters,
  setSpecialtiesFilters,
  setSpecialtiesPage,
  setSpecialtiesPageSize,
} from '../../store/specialties/specialties.slice';
import type { SpecialtiesFilters } from '../../types/specialty.types';

const STATUS_OPTIONS = [
  { label: 'Todas', value: 'all' },
  { label: 'Ativas', value: 'true' },
  { label: 'Inativas', value: 'false' },
] as const;

type SpecialtyRow = {
  id: number;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
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
  {
    key: 'description',
    label: 'Descrição',
  },
  {
    label: 'Ações',
    variant: 'actions',
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

export function Specialties() {
  const dispatch = useAppDispatch();
  const specialties = useAppSelector(selectSpecialtiesList);
  const pagination = useAppSelector(selectSpecialtiesListPagination);
  const filters = useAppSelector(selectSpecialtiesListFilters);
  const page = useAppSelector(selectSpecialtiesListPage);
  const pageSize = useAppSelector(selectSpecialtiesListPageSize);
  const loading = useAppSelector(selectSpecialtiesListLoading);
  const error = useAppSelector(selectSpecialtiesListError);

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
  }));

  const searchOptions = Array.from(new Set(
    specialties.flatMap(({ code, name }) => [code, name]),
  ));

  const handleFilterChange = (values: Readonly<Record<string, unknown>>) => {
    const query = autocompleteValue(values.query);
    const status = typeof values.isActive === 'string' ? values.isActive : undefined;
    const nextFilters: SpecialtiesFilters = {
      ...(query ? { query } : {}),
      ...(status === 'true' ? { isActive: true } : status === 'false' ? { isActive: false } : {}),
    };

    dispatch(setSpecialtiesFilters(nextFilters));
  };

  const hasActiveFilters = Boolean(filters.query) || filters.isActive !== undefined;
  const paginationProps = {
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
  const emptyStateProps = hasActiveFilters
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
        loading={loading}
        pagination={paginationProps}
        emptyState={emptyStateProps}
      />
      <Snackbar {...apiErrorSnackbar} />
    </>
  );
}
