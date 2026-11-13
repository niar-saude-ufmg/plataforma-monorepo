import type { UserRole } from "@niar/contracts";
import type { RoleListConfig } from "../../types/role-list.types";

export type ProjectColumnId =
  | "title"
  | "researcher"
  | "status"
  | "evaluationStatus"
  | "updatedAt"
  | "actions";

export type ProjectFilterKey =
  | "search"
  | "status"
  | "evaluationStatus";

export type ProjectActionId = "history" | "documents";

export type ProjectListRoleConfig = RoleListConfig<ProjectColumnId, ProjectFilterKey> & {
  actions: readonly ProjectActionId[];
};

/** Configuração declarativa da listagem compartilhada de projetos por papel. */
export const PROJECT_LIST_CONFIG: Record<UserRole, ProjectListRoleConfig> = {
  admin: {
    title: "Projetos",
    description: "Gerencie os projetos, documentos e atribuições da comissão.",
    emptyStateDescription: "Ainda não existem projetos para exibir.",
    columnIds: [
      "title",
      "researcher",
      "status",
      "updatedAt",
      "actions",
    ],
    filters: ["search", "status"],
    actions: ["history", "documents"],
    columnLabels: { status: "Status do projeto" },
    filterLabels: { status: "Status do projeto" },
  },
  researcher: {
    title: "Meus projetos",
    description: "Acompanhe seus projetos, documentos e o status de cada etapa.",
    emptyStateDescription: "Você ainda não possui projetos cadastrados.",
    columnIds: ["title", "status", "updatedAt", "actions"],
    filters: ["search", "status"],
    actions: ["history", "documents"],
    columnLabels: { status: "Status" },
  },
  committee: {
    title: "Projetos",
    description:
      "Consulte os projetos disponíveis para avaliação, documentos e histórico de avaliações.",
    emptyStateDescription: "Ainda não existem projetos disponíveis para avaliação.",
    columnIds: [
      "title",
      "researcher",
      "status",
      "evaluationStatus",
      "updatedAt",
      "actions",
    ],
    filters: ["search", "status", "evaluationStatus"],
    actions: ["history", "documents"],
    columnLabels: {
      status: "Status do projeto",
      evaluationStatus: "Status da avaliação",
    },
    filterLabels: {
      status: "Status do projeto",
      evaluationStatus: "Status da avaliação",
    },
  },
};
