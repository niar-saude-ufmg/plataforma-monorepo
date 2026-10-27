import type { UserRole, UserRoleOption } from '../../types/user.types';

export type UserRoleProfile = 'none' | 'researcher' | 'committee';

export type UserRoleAlert = {
  severity: 'info' | 'success' | 'warning' | 'error';
  message: string;
};

export type UserRoleConfig = {
  label: string;
  description: string;
  profile: UserRoleProfile;
  alert?: UserRoleAlert;
};

export const USER_ROLE_CONFIG: Record<UserRole, UserRoleConfig> = {
  researcher: {
    label: 'Pesquisador',
    description: 'Preencha os dados para criar o acesso do pesquisador e registrar o parecer do COEP.',
    profile: 'researcher',
  },
  admin: {
    label: 'Administrador',
    description: 'Adicione um novo usuário administrador à plataforma.',
    profile: 'none',
    alert: {
      severity: 'warning',
      message: 'Este usuário terá acesso administrativo à plataforma.',
    },
  },
  auditor: {
    label: 'Auditor',
    description: 'Adicione um novo usuário auditor do NIAR à plataforma.',
    profile: 'none',
    alert: {
      severity: 'warning',
      message: 'Este usuário terá acesso às funções de auditoria da plataforma.',
    },
  },
  committee: {
    label: 'Membro do Comitê',
    description: 'Adicione um novo membro da comissão à plataforma.',
    profile: 'committee',
    alert: {
      severity: 'warning',
      message: 'Este usuário poderá participar da avaliação de projetos.',
    },
  },
};

export const USER_ROLE_OPTIONS: readonly UserRoleOption[] = Object.entries(USER_ROLE_CONFIG).map(
  ([value, config]) => ({
    value: value as UserRole,
    label: config.label,
  }),
);
