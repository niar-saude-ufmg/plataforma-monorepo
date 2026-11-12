import {
  EVALUATION_CONTEXT_LABELS,
  EVALUATION_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
} from "@niar/contracts";
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
  Fragment,
  useEffect,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { ProjectDocumentsDialog } from "../../components/ProjectDocumentsDialog";
import { ProjectHistoryDialog } from "../../components/ProjectHistoryDialog";
import { useApiError } from "../../hooks/use-api-error/use-api-error";
import { selectAuthSelected } from "../../store/auth/auth.selectors";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  downloadProjectDocument,
  getProjects,
} from "../../store/projects/projects.api";
import {
  selectProjectsDownloadError,
  selectProjectsDownloadFilename,
  selectProjectsDownloadLoading,
  selectProjectsList,
  selectProjectsListError,
  selectProjectsListFilters,
  selectProjectsListLoading,
  selectProjectsListPage,
  selectProjectsListPageSize,
  selectProjectsListPagination,
  selectProjectsSelected,
} from "../../store/projects/projects.selectors";
import {
  clearProjectsError,
  clearProjectsFilters,
  clearSelectedProject,
  setProjectsFilters,
  setProjectsPage,
  setProjectsPageSize,
  setSelectedProject,
} from "../../store/projects/projects.slice";
import type {
  EvaluationContext,
  EvaluationStatus,
  Project,
  ProjectDocument,
  ProjectStatus,
  ProjectStatusEntry,
} from "../../types/project.types";
import {
  PROJECT_LIST_CONFIG,
  type ProjectActionId,
  type ProjectColumnId,
  type ProjectFilterKey,
} from "./Projects.roles";

const PROJECT_STATUS_CHIP: Record<ProjectStatus, StatusChipStatus> = {
  submitted_for_review: "default",
  submitted_to_committee: "default",
  approved_to_schedule: "success",
  rejected_to_safe_room: "error",
  resubmitted_for_review: "info",
  resubmitted_to_committee: "info",
  under_review: "info",
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

const EVALUATION_STATUS_CHIP: Record<EvaluationStatus, StatusChipStatus> = {
  waiting: "default",
  to_review: "warning",
  sent_to_committee: "info",
  approved_by_committee: "success",
  rejected_by_committee: "error",
  needs_changes_by_committee: "warning",
  needs_changes: "warning",
  approved: "success",
  rejected: "error",
};

const PROJECT_STATUS_OPTIONS: readonly AutocompleteOption[] = (
  Object.keys(PROJECT_STATUS_CHIP) as ProjectStatus[]
).map((value) => ({ value, label: PROJECT_STATUS_LABELS[value] }));

const EVALUATION_STATUS_OPTIONS: readonly AutocompleteOption[] = (
  Object.keys(EVALUATION_STATUS_LABELS) as EvaluationStatus[]
).map((value) => ({ value, label: EVALUATION_STATUS_LABELS[value] }));

const EVALUATION_CONTEXT_OPTIONS: readonly AutocompleteOption[] = (
  Object.keys(EVALUATION_CONTEXT_LABELS) as EvaluationContext[]
).map((value) => ({ value, label: EVALUATION_CONTEXT_LABELS[value] }));

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
  (entry ? PROJECT_STATUS_LABELS[entry.code] : undefined) ??
  entry?.label ??
  "Status não informado";

const statusColor = (entry: ProjectStatusEntry | undefined): StatusChipStatus => {
  if (!entry) return "default";
  return PROJECT_STATUS_CHIP[entry.code] ?? "default";
};

const evaluationStatus = (project: Project): EvaluationStatus | undefined =>
  project.evaluationStatus ??
  (project.evaluations && project.evaluations.length === 0
    ? "waiting"
    : undefined);

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
  const [activeDialog, setActiveDialog] = useState<
    "history" | "documents" | null
  >(null);
  const [dismissedDownloadFilename, setDismissedDownloadFilename] = useState<
    string | null
  >(null);
  const user = useAppSelector(selectAuthSelected);
  const projects = useAppSelector(selectProjectsList);
  const selectedProject = useAppSelector(selectProjectsSelected);
  const filters = useAppSelector(selectProjectsListFilters);
  const pagination = useAppSelector(selectProjectsListPagination);
  const page = useAppSelector(selectProjectsListPage);
  const pageSize = useAppSelector(selectProjectsListPageSize);
  const loading = useAppSelector(selectProjectsListLoading);
  const error = useAppSelector(selectProjectsListError);
  const downloadLoading = useAppSelector(selectProjectsDownloadLoading);
  const downloadError = useAppSelector(selectProjectsDownloadError);
  const downloadedFilename = useAppSelector(selectProjectsDownloadFilename);
  const roleConfig =
    PROJECT_LIST_CONFIG[user?.role ?? "researcher"];

  useEffect(() => {
    dispatch(
      getProjects({
        page,
        pageSize,
        search: filters.search || undefined,
        status: filters.status || undefined,
        evaluationStatus: filters.evaluationStatus || undefined,
        evaluationContext: filters.evaluationContext || undefined,
      }),
    );
  }, [
    dispatch,
    filters.evaluationContext,
    filters.evaluationStatus,
    filters.search,
    filters.status,
    page,
    pageSize,
  ]);

  const handleFiltersChange = (values: Readonly<Record<string, unknown>>) => {
    dispatch(
      setProjectsFilters({
        search: optionValue(values.search),
        status: optionValue(values.status) as ProjectStatus | undefined,
        evaluationStatus: optionValue(values.evaluationStatus) as
          | EvaluationStatus
          | undefined,
        evaluationContext: optionValue(values.evaluationContext) as
          | EvaluationContext
          | undefined,
      }),
    );
  };

  const handleClearFilters = () => dispatch(clearProjectsFilters());

  const openProjectDialog = (
    dialog: "history" | "documents",
    project: Project,
  ) => {
    dispatch(setSelectedProject(project));
    setActiveDialog(dialog);
  };

  const closeProjectDialog = () => {
    setActiveDialog(null);
    dispatch(clearSelectedProject());
  };

  const handleDownloadDocument = (document: ProjectDocument) => {
    if (!selectedProject) return;
    setDismissedDownloadFilename(null);
    dispatch(
      downloadProjectDocument({
        projectId: selectedProject.id,
        documentId: document.id,
      }),
    );
  };

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

  const filterValues: Record<ProjectFilterKey, AutocompleteOption | null> = {
    search: selectedSearch,
    status: selectedOption(PROJECT_STATUS_OPTIONS, filters.status),
    evaluationStatus: selectedOption(
      EVALUATION_STATUS_OPTIONS,
      filters.evaluationStatus,
    ),
    evaluationContext: selectedOption(
      EVALUATION_CONTEXT_OPTIONS,
      filters.evaluationContext,
    ),
  };

  const filterDefinitions: Record<ProjectFilterKey, AutocompleteOption[] | undefined> = {
    search: searchOptions,
    status: [...PROJECT_STATUS_OPTIONS],
    evaluationStatus: [...EVALUATION_STATUS_OPTIONS],
    evaluationContext: [...EVALUATION_CONTEXT_OPTIONS],
  };

  const filter = (
    <Filter
      search={roleConfig.filters.map((key) => ({
        key,
        label:
          roleConfig.filterLabels?.[key] ??
          ({
            search: "Buscar projeto",
            status: "Status",
            evaluationStatus: "Status da avaliação",
            evaluationContext: "Contexto da avaliação",
          } satisfies Record<ProjectFilterKey, string>)[key],
        options: filterDefinitions[key] ?? [],
        ...(key === "search" ? { freeSolo: true } : {}),
      }))}
      values={Object.fromEntries(
        roleConfig.filters.map((key) => [key, filterValues[key]]),
      )}
      onChange={handleFiltersChange}
    />
  );

  const actionDefinitions: Record<
    ProjectActionId,
    (project: Project) => ReactNode
  > = {
    history: (project) => (
      <Button
        type="button"
        size="small"
        variant="outlined"
        onClick={() => openProjectDialog("history", project)}
      >
        Histórico
      </Button>
    ),
    documents: (project) =>
      project.documents.length ? (
        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={() => openProjectDialog("documents", project)}
        >
          Documentos
        </Button>
      ) : null,
  };

  const columnDefinitions: Record<ProjectColumnId, TableColumn<Project>> = {
    title: { key: "title", label: "Projeto" },
    researcher: {
      key: "researcher",
      label: "Pesquisador",
      render: (_value, project) => project.researcher.fullName,
    },
    status: {
      key: "status",
      label: "Status",
      render: (_value, project) => {
        const entry = latestStatus(project);
        return <StatusChip label={statusLabel(entry)} status={statusColor(entry)} />;
      },
    },
    evaluationContext: {
      key: "evaluationContext",
      label: "Contexto",
      render: (_value, project) =>
        project.evaluationContext
          ? EVALUATION_CONTEXT_LABELS[project.evaluationContext]
          : "—",
    },
    evaluationStatus: {
      key: "evaluationStatus",
      label: "Status da avaliação",
      render: (_value, project) => {
        const status = evaluationStatus(project);
        return status ? (
          <StatusChip
            label={EVALUATION_STATUS_LABELS[status]}
            status={EVALUATION_STATUS_CHIP[status]}
          />
        ) : (
          "—"
        );
      },
    },
    updatedAt: {
      key: "updatedAt",
      label: "Atualizado",
      render: (value) => formatDate(String(value)),
    },
    evaluations: {
      key: "evaluations",
      label: "Avaliador",
      render: (_value, project) =>
        project.evaluations?.at(-1)?.assignedTo?.fullName ?? "A definir",
    },
    actions: {
      variant: "actions",
      label: "Ações",
      render: (_value, project) => (
        <>
          {roleConfig.actions.map((actionId) => (
            <Fragment key={actionId}>
              {actionDefinitions[actionId](project)}
            </Fragment>
          ))}
        </>
      ),
    },
  };

  const columns = roleConfig.columnIds.map((columnId) => {
    const column = columnDefinitions[columnId];
    const label = roleConfig.columnLabels?.[columnId];
    return label ? { ...column, label } : column;
  });

  const paginationProps = {
    labelRowsPerPage: 'Linhas por página',
    labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) => `${from}–${to} de ${count}`,
    getItemAriaLabel: (type: 'first' | 'last' | 'next' | 'previous') => ({ first: 'Primeira página', last: 'Última página', next: 'Próxima página', previous: 'Página anterior' })[type],
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

  const hasActiveFilters = roleConfig.filters.some((key) => Boolean(filters[key]));
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
        description: roleConfig.emptyStateDescription,
      };

  const errorSnackbar = useApiError(
    error,
    () => dispatch(clearProjectsError()),
    "Não foi possível carregar os projetos. Tente novamente.",
  );
  const downloadErrorSnackbar = useApiError(
    downloadError,
    () => dispatch(clearProjectsError()),
    "Não foi possível baixar o documento. Tente novamente.",
  );
  const downloadSuccessOpen = Boolean(
    downloadedFilename && downloadedFilename !== dismissedDownloadFilename,
  );

  return (
    <>
      <Listing
        title={roleConfig.title}
        description={roleConfig.description}
        filter={filter}
        columns={toListingColumns(columns)}
        rows={toListingRows(projects)}
        loading={loading}
        pagination={paginationProps}
        emptyState={emptyStateProps}
      />
      <ProjectHistoryDialog
        open={activeDialog === "history"}
        project={selectedProject}
        onClose={closeProjectDialog}
      />
      <ProjectDocumentsDialog
        open={activeDialog === "documents"}
        project={selectedProject}
        downloadLoading={downloadLoading}
        onDownload={handleDownloadDocument}
        onClose={closeProjectDialog}
      />
      <Snackbar {...errorSnackbar} />
      <Snackbar {...downloadErrorSnackbar} />
      <Snackbar
        open={downloadSuccessOpen}
        message={
          downloadedFilename
            ? `Download de ${downloadedFilename} concluído.`
            : ""
        }
        severity="success"
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setDismissedDownloadFilename(downloadedFilename)}
      />
    </>
  );
}
