/**
 * Contratos de dados do módulo de projetos.
 *
 * Regra: a UI só conhece estes tipos (camelCase). A API devolve snake_case.
 * A conversão acontece no service (services/projects/admin-api.ts).
 */

/** Resultado da avaliação da comissão. */
export type EvaluationStatus =
  | "waiting"
  | "to_review"
  | "approved"
  | "needs_changes"
  | "rejected";

/** Pesquisador dono do projeto (resumo exibido na lista). */
export interface ResearcherSummary {
  id: number;
  fullName: string;
  email: string;
}

/** Item do histórico de status do projeto. */
export interface ProjectStatusEntry {
  code: string;
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
  downloadUrl: string;
}

/** Documento vinculado a uma versão do projeto. */
export interface ProjectDocument {
  id: number;
  versionNumber: number;
  documentType: string;
  originalFilename: string;
  createdAt: string;
  downloadUrl: string;
}

/** Membro do comitê responsável pela avaliação. */
export interface ResponsibleMember {
  userId: number;
  fullName: string;
  email: string;
  specialty: {
    id: number;
    name: string;
  };
}

/** Avaliação da comissão sobre uma versão. */
export interface ProjectEvaluation {
  id: number;
  versionNumber: number;
  result: EvaluationStatus;
  responsibleMember: ResponsibleMember;
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

/** Paginação padrão da listagem. */
export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ProjectListParams {
  page?: number;
  pageSize?: number;
  evaluationStatus?: EvaluationStatus;
}

export interface ProjectListResponse {
  items: Project[];
  pagination: Pagination;
}
