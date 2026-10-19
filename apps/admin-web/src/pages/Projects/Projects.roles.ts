import type { UserRole } from "@niar/contracts";
import type { RoleListConfig } from "../../types/role-list.types";

export type ProjectColumnId =
  | "title"
  | "researcher"
  | "status"
  | "evaluationContext"
  | "updatedAt"
  | "evaluations"
  | "actions";

export type ProjectFilterKey = "search" | "status";

export type ProjectActionId = "details";

export type ProjectListRoleConfig = RoleListConfig<ProjectColumnId, ProjectFilterKey> & {
  actions: readonly ProjectActionId[];
};

/**
 * Configuração das colunas e filtros disponíveis por papel na listagem de
 * projetos. Auditor e comitê serão adicionados no card específico desses
 * perfis.
 */
export const PROJECT_LIST_CONFIG: Partial<
  Record<UserRole, ProjectListRoleConfig>
> = {
  admin: {
    title: "Projetos",
    description: "Gerencie os projetos, documentos e atribuições da comissão.",
    emptyStateDescription: "Ainda não existem projetos para exibir.",
    columnIds: [
      "title",
      "researcher",
      "status",
      "evaluationContext",
      "updatedAt",
      "evaluations",
      "actions",
    ],
    filters: ["search", "status"],
    actions: ["details"],
    columnLabels: { status: "Status do projeto" },
    filterLabels: { status: "Status do projeto" },
  },
  researcher: {
    title: "Meus projetos",
    description: "Acompanhe seus projetos, documentos e o status de cada etapa.",
    emptyStateDescription: "Você ainda não possui projetos cadastrados.",
    columnIds: ["title", "status", "updatedAt", "actions"],
    filters: ["search", "status"],
    actions: ["details"],
    columnLabels: { status: "Status" },
  },
};
