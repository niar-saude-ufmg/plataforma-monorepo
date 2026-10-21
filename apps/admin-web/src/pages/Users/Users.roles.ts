import type { UserRole } from "../../types/user.types";
import type { RoleListConfig } from "../../types/role-list.types";

export type UserColumnId =
  | "fullName"
  | "email"
  | "role"
  | "accountStatus"
  | "actions";

export type UserFilterKey = "search" | "role" | "accountStatus";

export type UserActionId =
  | "details"
  | "evaluate"
  | "activate"
  | "deactivate";

export type UserListRoleConfig = RoleListConfig<UserColumnId, UserFilterKey> & {
  actions: readonly UserActionId[];
};

/**
 * Configuração declarativa da listagem de usuários por papel.
 * A tela pode compartilhar as definições de colunas e filtros quando novos
 * papéis passarem a ter acesso à gestão de usuários.
 */
export const USER_LIST_CONFIG: Partial<
  Record<UserRole, UserListRoleConfig>
> = {
  admin: {
    title: "Usuários",
    description: "Gerencie os usuários e o status de acesso à plataforma.",
    emptyStateDescription: "Ainda não existem usuários para exibir.",
    columnIds: ["fullName", "email", "role", "accountStatus", "actions"],
    filters: ["search", "role", "accountStatus"],
    actions: ["details"],
    filterLabels: {
      search: "Buscar usuário",
      accountStatus: "Status",
    },
  },
  committee: {
    title: "Usuários do Comitê",
    description: "Consulte os usuários e o status de acesso à plataforma.",
    emptyStateDescription: "Ainda não existem usuários para exibir.",
    columnIds: ["fullName", "email", "accountStatus", "actions"],
    filters: ["search", "accountStatus"],
    actions: ["details"],
    filterLabels: {
      search: "Buscar usuário",
      accountStatus: "Status",
    },
  },
  auditor: {
    title: "Usuários Auditores",
    description: "Consulte os usuários e o status de acesso à plataforma.",
    emptyStateDescription: "Ainda não existem usuários para exibir.",
    columnIds: ["fullName", "email", "accountStatus", "actions"],
    filters: ["search", "accountStatus"],
    actions: ["details"],
    filterLabels: {
      search: "Buscar usuário",
      role: "Perfil",
      accountStatus: "Status",
    },
  },
};
