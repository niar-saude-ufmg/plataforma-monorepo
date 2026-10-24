import type { UserRole } from "@niar/contracts";

export type RoleRoute = {
  label: string;
  path: string;
};

export type RoleSection =
  | "home"
  | "projetos"
  | "usuarios"
  | "usuarios/novo"
  | "especialidades"
  | "perfil";

export type RoleRouteDefinition = {
  label: string;
  section: RoleSection;
  hidden?: boolean;
};

const rolePathSegments: Record<UserRole, string> = {
  admin: "administrador",
  researcher: "pesquisador",
  auditor: "auditor",
  committee: "comite",
};

const commonRoleRouteDefinitions: readonly RoleRouteDefinition[] = [
  { label: "Início", section: "home" },
];

const roleRouteDefinitions: Record<UserRole, readonly RoleRouteDefinition[]> = {
  admin: [
    ...commonRoleRouteDefinitions,
    { label: "Projetos", section: "projetos" },
    { label: "Usuários", section: "usuarios" },
    { label: "Novo usuário", section: "usuarios/novo", hidden: true },
    { label: "Especialidades", section: "especialidades" },
    { label: "Perfil", section: "perfil" },
  ],
  researcher: [
    ...commonRoleRouteDefinitions,
    { label: "Meus projetos", section: "projetos" },
    { label: "Perfil", section: "perfil" },
  ],
  auditor: [
    ...commonRoleRouteDefinitions,
    { label: "Usuários", section: "usuarios" },
  ],
  committee: [
    ...commonRoleRouteDefinitions,
    { label: "Usuários", section: "usuarios" },
  ],
};

export const getRoleBasePath = (role: UserRole) =>
  `/admin/${rolePathSegments[role]}`;

export const getRoleHomePath = (role: UserRole) =>
  `${getRoleBasePath(role)}/home`;

export const getRoleRouteDefinitions = (role: UserRole) =>
  roleRouteDefinitions[role];

export const getRoleRoutePath = (role: UserRole, section: RoleSection) =>
  `${getRoleBasePath(role)}/${section}`;

export const getSpecialtyCreatePath = (role: UserRole) =>
  `${getRoleRoutePath(role, "especialidades")}/novo`;

export const getSpecialtyEditPath = (role: UserRole) =>
  `${getRoleRoutePath(role, "especialidades")}/editar`;

export const getRoleNavigation = (role: UserRole): readonly RoleRoute[] => {
  return getRoleRouteDefinitions(role)
    .filter((definition) => !definition.hidden)
    .map(({ label, section }) => ({
      label,
      path: getRoleRoutePath(role, section),
    }));
};
