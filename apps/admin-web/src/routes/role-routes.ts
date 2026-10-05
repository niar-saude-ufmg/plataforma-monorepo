import type { UserRole } from "@niar/contracts";

export type RoleRoute = {
  label: string;
  path: string;
};

export type RoleSection = "home" | "projetos";

export type RoleRouteDefinition = {
  label: string;
  section: RoleSection;
};

const rolePathSegments: Record<UserRole, string> = {
  admin: "administrador",
  researcher: "pesquisador",
  committee: "comite",
};

const commonRoleRouteDefinitions: readonly RoleRouteDefinition[] = [
  { label: "Início", section: "home" },
];

const roleRouteDefinitions: Record<UserRole, readonly RoleRouteDefinition[]> = {
  admin: [
    ...commonRoleRouteDefinitions,
    { label: "Projetos", section: "projetos" },
  ],
  researcher: [
    ...commonRoleRouteDefinitions,
    { label: "Projetos", section: "projetos" },
  ],
  committee: [
    ...commonRoleRouteDefinitions,
    { label: "Projetos", section: "projetos" },
  ],
};

export const getRoleBasePath = (role: UserRole) => `/admin/${rolePathSegments[role]}`;

export const getRoleHomePath = (role: UserRole) => `${getRoleBasePath(role)}/home`;

export const getRoleRouteDefinitions = (role: UserRole) => roleRouteDefinitions[role];

export const getRoleRoutePath = (role: UserRole, section: RoleSection) =>
  `${getRoleBasePath(role)}/${section}`;

export const getRoleNavigation = (role: UserRole): readonly RoleRoute[] => {
  return getRoleRouteDefinitions(role).map(({ label, section }) => ({
    label,
    path: getRoleRoutePath(role, section),
  }));
};
