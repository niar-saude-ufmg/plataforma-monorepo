import {
  Button,
  Filter,
  Listing,
  Snackbar,
  StatusChip,
  type AutocompleteOption,
  type StatusChipStatus,
  type TableColumn,
} from "@niar/ui";
import {
  EVALUATION_CONTEXT_LABELS,
  PROJECT_STATUS_LABELS,
  type ProjectStatus as ContractProjectStatus,
} from "@niar/contracts";
import { useEffect, type ChangeEvent } from "react";
import { useApiError } from "../../hooks/use-api-error/use-api-error";
import { selectAuthUser } from "../../store/auth/auth.slice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getProjects } from "../../store/projects/projects.api";
import {
  selectProjectsList,
  selectProjectsListError,
  selectProjectsListFilters,
  selectProjectsListLoading,
  selectProjectsListPage,
  selectProjectsListPageSize,
  selectProjectsListPagination,
} from "../../store/projects/projects.selectors";
import {
  clearProjectsError,
  clearProjectsFilters,
  setProjectsFilters,
  setProjectsPage,
  setProjectsPageSize,
} from "../../store/projects/projects.slice";
import type {
  Project,
  ProjectStatus,
  ProjectStatusEntry,
} from "../../types/project.types";

const PROJECT_STATUS_CODES: readonly ProjectStatus[] = [
  "submitted_to_committee",
  "resubmitted_to_committee",
  "under_review",
  "needs_changes",
  "approved",
  "rejected",
];

const PROJECT_STATUS_OPTIONS: readonly AutocompleteOption[] =
  PROJECT_STATUS_CODES.map((value) => ({
    value,
    label: PROJECT_STATUS_LABELS[value],
  }));

const PROJECT_STATUS_CHIP: Partial<
  Record<ContractProjectStatus, StatusChipStatus>
> = {
  submitted_for_review: "default",
  submitted_to_committee: "default",
  approved_to_schedule: "success",
  rejected_to_safe_room: "error",
  resubmitted_for_review: "info",
  resubmitted_to_committee: "info",
  under_review: "warning",
  scheduled_for_safe_room: "info",
  approved_for_safe_room: "success",
  under_safe_room: "info",
  report_submitted: "success",
  report_under_review: "info",
  safe_room_reuse_requested: "warning",
  rescheduled_for_safe_room: "info",
  reapproved_for_safe_room: "success",
  report_resubmitted: "info",
  needs_changes: "warning",
  approved: "success",
  rejected: "error",
};

const optionValue = (value: unknown): string | undefined => {
  if (typeof value === "string") return value.trim() || undefined;
  if (value && typeof value === "object" && "value" in value) {
    const option = String((value as { value: unknown }).value).trim();
    return option || undefined;
  }
  return undefined;
};

const selectedOption = (
  options: readonly AutocompleteOption[],
  value: string | undefined,
): AutocompleteOption | null =>
  options.find((option) => option.value === value) ?? null;

const latestStatus = (project: Project): ProjectStatusEntry | undefined =>
  project.status.at(-1);

const statusLabel = (entry: ProjectStatusEntry | undefined) =>
  (entry && entry.code in PROJECT_STATUS_LABELS
    ? PROJECT_STATUS_LABELS[entry.code as ContractProjectStatus]
    : undefined) ??
  entry?.label ??
  "Status não informado";

const statusColor = (entry: ProjectStatusEntry | undefined): StatusChipStatus => {
  if (!entry) return "default";
  return PROJECT_STATUS_CHIP[entry.code as ContractProjectStatus] ?? "default";
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
};

const toListingColumns = (columns: readonly TableColumn<Project>[]) =>
  columns as unknown as readonly TableColumn<Record<string, unknown>>[];

const toListingRows = (projects: readonly Project[]) =>
  projects as unknown as readonly Record<string, unknown>[];

export function Projects() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const projects = useAppSelector(selectProjectsList);
  const filters = useAppSelector(selectProjectsListFilters);
  const pagination = useAppSelector(selectProjectsListPagination);
  const page = useAppSelector(selectProjectsListPage);
  const pageSize = useAppSelector(selectProjectsListPageSize);
  const loading = useAppSelector(selectProjectsListLoading);
  const error = useAppSelector(selectProjectsListError);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    dispatch(
      getProjects({
        page,
        pageSize,
        search: filters.search || undefined,
        status: filters.status || undefined,
      }),
    );
  }, [dispatch, filters.search, filters.status, page, pageSize]);

  const handleFiltersChange = (values: Readonly<Record<string, unknown>>) => {
    dispatch(
      setProjectsFilters({
        search: optionValue(values.search),
        status: optionValue(values.status) as ProjectStatus | undefined,
      }),
    );
  };

  const handleClearFilters = () => dispatch(clearProjectsFilters());

  const searchOptions = projects.map((project) => ({
    value: String(project.id),
    label: `${project.title} — #${project.id}`,
  }));
  const selectedSearch = filters.search
    ? selectedOption(searchOptions, filters.search) ?? {
        value: filters.search,
        label: filters.search,
      }
    : null;

  const filter = (
    <Filter
      search={[
        {
          key: "search",
          label: "Buscar projeto",
          options: searchOptions,
          freeSolo: true,
        },
        {
          key: "status",
          label: isAdmin ? "Status do projeto" : "Status",
          options: PROJECT_STATUS_OPTIONS,
        },
      ]}
      values={{
        search: selectedSearch,
        status: selectedOption(PROJECT_STATUS_OPTIONS, filters.status),
      }}
      onChange={handleFiltersChange}
    />
  );

  const columns: TableColumn<Project>[] = [
    { key: "title", label: "Projeto" },
    ...(isAdmin
      ? [
          {
            key: "researcher" as const,
            label: "Pesquisador",
            render: (_value: Project[keyof Project], project: Project) =>
              project.researcher.fullName,
          },
        ]
      : []),
    {
      key: "status",
      label: isAdmin ? "Status do projeto" : "Status",
      render: (_value, project) => {
        const entry = latestStatus(project);
        return (
          <StatusChip
            label={statusLabel(entry)}
            status={statusColor(entry)}
          />
        );
      },
    },
    ...(isAdmin
      ? [
          {
            key: "evaluationContext" as const,
            label: "Contexto",
            render: (_value: Project[keyof Project], project: Project) =>
              project.evaluationContext
                ? EVALUATION_CONTEXT_LABELS[project.evaluationContext]
                : "—",
          },
        ]
      : []),
    {
      key: "updatedAt",
      label: "Atualizado",
      render: (value) => formatDate(String(value)),
    },
    ...(isAdmin
      ? [
          {
            key: "evaluations" as const,
            label: "Avaliador",
            render: (_value: Project[keyof Project], project: Project) =>
              project.evaluations?.at(-1)?.responsibleMember.fullName ??
              "A definir",
          },
        ]
      : []),
    {
      key: "id",
      label: "Ações",
      render: () => (
        <Button type="button" size="small" variant="outlined">
          Detalhes
        </Button>
      ),
    },
  ];

  const paginationProps = {
    count: pagination?.totalItems ?? 0,
    page: (pagination?.page ?? page) - 1,
    rowsPerPage: pagination?.pageSize ?? pageSize,
    onPageChange: (_event: unknown, nextPage: number) => {
      dispatch(setProjectsPage(nextPage + 1));
    },
    onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(setProjectsPageSize(Number(event.target.value)));
    },
  };

  const hasActiveFilters = Boolean(filters.search || filters.status);
  const emptyStateProps = hasActiveFilters
    ? {
        title: "Nenhum projeto encontrado",
        description: "Não encontramos projetos com os filtros selecionados.",
        action: (
          <Button type="button" variant="text" onClick={handleClearFilters}>
            Limpar filtros
          </Button>
        ),
      }
    : {
        title: "Nenhum projeto cadastrado",
        description: isAdmin
          ? "Ainda não existem projetos para exibir."
          : "Você ainda não possui projetos cadastrados.",
      };

  const errorSnackbar = useApiError(
    error,
    () => dispatch(clearProjectsError()),
    "Não foi possível carregar os projetos. Tente novamente.",
  );

  return (
    <>
      <Listing
        title={isAdmin ? "Projetos" : "Meus projetos"}
        description={
          isAdmin
            ? "Gerencie os projetos, documentos e atribuições da comissão."
            : "Acompanhe seus projetos, documentos e o status de cada etapa."
        }
        filter={filter}
        columns={toListingColumns(columns)}
        rows={toListingRows(projects)}
        loading={loading}
        pagination={paginationProps}
        emptyState={emptyStateProps}
      />
      <Snackbar {...errorSnackbar} />
    </>
  );
}
