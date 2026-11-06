import type { RoleDetailsConfig, RoleDetailsSection } from '../../types/role-details';
import type { UserListItem, UserRole } from "../../types/user.types";
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
    actions: ["details", "evaluate", "deactivate", "activate"],
    filterLabels: {
      search: "Buscar usuário",
      role: "Perfil",
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
      accountStatus: "Status",
    },
  },
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  researcher: 'Pesquisador',
  committee: 'Comitê gestor',
  auditor: 'Auditor',
};

const statusLabels = {
  pending: 'Pendente',
  active: 'Ativo',
  rejected: 'Rejeitado',
  disabled: 'Desativado',
};

const detailsTitle = (user: UserListItem) => `Detalhes de ${user.fullName}`;

const accountSection: RoleDetailsSection<UserListItem> = {
  id: 'account',
  items: [
    { id: 'fullName', label: 'Nome completo', render: (user) => user.fullName },
    { id: 'email', label: 'E-mail', render: (user) => user.email },
    {
      id: 'roleAndStatus',
      label: 'Perfil e status',
      render: (user) => `${roleLabels[user.role]} · ${statusLabels[user.accountStatus]}`,
    },
  ],
};

export const USER_DETAILS_CONFIG: Partial<Record<UserRole, RoleDetailsConfig<UserListItem>>> = {
  admin: {
    title: detailsTitle,
    sections: [accountSection],
  },
  researcher: {
    title: detailsTitle,
    sections: [
      { ...accountSection, title: 'Dados da conta' },
      {
        id: 'coep',
        title: 'Dados do COEP',
        items: [
          { id: 'caae', label: 'CAAE', render: (user) => user.coep?.caae || 'Não informado' },
          { id: 'opinionNumber', label: 'Número do parecer', render: (user) => user.coep?.opinionNumber || 'Não informado' },
          {
            id: 'approvalDate',
            label: 'Data de aprovação',
            render: (user) => user.coep?.approvalDate
              ? user.coep.approvalDate.slice(0, 10).split('-').reverse().join('/')
              : 'Não informado',
          },
        ],
      },
    ],
  },
  committee: {
    title: detailsTitle,
    sections: [
      { ...accountSection, title: 'Dados da conta' },
      {
        id: 'committee',
        title: 'Dados do comitê',
        items: [
          { id: 'specialty', label: 'Especialidade', render: (user) => user.committeeProfile?.specialty.name || 'Não informado' },
        ],
      },
    ],
  },
  auditor: {
    title: detailsTitle,
    sections: [accountSection],
  },
};
