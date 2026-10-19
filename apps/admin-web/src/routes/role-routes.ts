import type { UserRole } from "@niar/contracts";

export type RoleRoute = {
  label: string;
  path: string;
};

export type RoleSection = "home" | "projetos" | "usuarios" | "especialidades";

export type RoleRouteDefinition = {
  label: string;
  section: RoleSection;
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
    { label: "Especialidades", section: "especialidades" },
  ],
  researcher: [
    ...commonRoleRouteDefinitions,
    { label: "Meus projetos", section: "projetos" },
  ],
  auditor: [
    ...commonRoleRouteDefinitions,
  ],
  committee: [
    ...commonRoleRouteDefinitions,
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

export const getRoleNavigation = (role: UserRole): readonly RoleRoute[] => {
  return getRoleRouteDefinitions(role).map(({ label, section }) => ({
    label,
    path: getRoleRoutePath(role, section),
  }));
};
