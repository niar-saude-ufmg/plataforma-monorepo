import type { EvaluationStatus as ContractEvaluationStatus, ProjectStatus as ContractProjectStatus } from "@niar/contracts";

/**
 * Contratos de dados do módulo de projetos.
 *
 * Regra: a UI só conhece estes tipos (camelCase). A API devolve snake_case.
 * A conversão acontece no service (services/projects/projects.service.ts).
 */

/** Resultado da avaliação da comissão. */
export type EvaluationStatus = ContractEvaluationStatus;

/** Status persistidos no domínio administrativo de projetos. */
export type ProjectStatus = Exclude<
  ContractProjectStatus,
  "draft" | "saved" | "changes_requested"
>;

/** Pesquisador dono do projeto (resumo exibido na lista). */
export interface ResearcherSummary {
  id: number;
  fullName: string;
  email: string;
}

/** Item do histórico de status do projeto. */
export interface ProjectStatusEntry {
  code: ProjectStatus;
  label: string;
  versionNumber: number;
  createdAt: string;
  notes: string | null;
}

/** Documento vinculado a uma versão do projeto. */
export interface ProjectDocument {
  id: number;
  versionNumber: number;
  documentType: string;
  originalFilename: string;
  createdAt: string;
}

/** Avaliação unificada de uma versão. */
export interface ProjectEvaluation {
  id: number;
  versionNumber: number;
  status: EvaluationStatus;
  justification: string | null;
  certificationDecision: "granted" | "not_granted" | null;
  certificationReason: string | null;
  evaluatedAt: string | null;
  updatedAt: string;
}

/**
 * Projeto como a UI precisa dele.
 *
 * `evaluationStatus` e `evaluations` só vêm para admin e committee.
 * Para researcher, ficam `undefined`.
 */
export interface Project {
  id: number;
  title: string;
  updatedAt: string;
  researcher: ResearcherSummary;
  status: ProjectStatusEntry[];
  documents: ProjectDocument[];
  evaluationStatus?: EvaluationStatus;
  evaluations?: ProjectEvaluation[];
}

export type ProjectListItem = Project;

/** Paginação padrão da listagem. */
export interface ProjectListPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export type ProjectListFilters = Pick<
  ProjectListParams,
  "search" | "status" | "evaluationStatus"
>;

export interface ProjectListParams {
  page?: number;
  pageSize?: number;
  status?: ProjectStatus;
  evaluationStatus?: EvaluationStatus;
  submittedFrom?: string;
  submittedTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  versionNumber?: number;
  documentType?: string;
  hasDocument?: boolean;
  search?: string;
  orderBy?: "updated_at" | "submitted_at" | "title" | "id";
  orderDirection?: "asc" | "desc";
}

export interface ProjectListResponse {
  items: ProjectListItem[];
  pagination: ProjectListPagination;
}
