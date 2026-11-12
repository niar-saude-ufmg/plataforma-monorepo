import type { UserRole } from "@niar/contracts";
import { Navigate, useLocation, useMatch, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import { useAppSelector } from "../../store/hooks";
import { selectAuthSelected } from "../../store/auth/auth.selectors";
import { getRoleBasePath, getRoleHomePath, getRoleRouteDefinitions } from "../../routes/role-routes";

type RoleGuardProps = {
  allowedRoles?: readonly UserRole[];
  children: ReactNode;
};

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const location = useLocation();
  const { role: routeRole } = useParams<{ role?: string }>();
  const sectionMatch = useMatch("/admin/:role/:section/*");
  const user = useAppSelector(selectAuthSelected);

  if (!user) {
    return <Navigate replace to="/login" state={{ from: location.pathname }} />;
  }

  const hasMatchingRouteRole = `/admin/${routeRole}` === getRoleBasePath(user.role);
  const section = sectionMatch?.params.section;
  const hasSection = !section || getRoleRouteDefinitions(user.role)
    .some((definition) => definition.section === section);
  const hasAllowedRole = !allowedRoles || allowedRoles.includes(user.role);

  if (!hasMatchingRouteRole || !hasSection || !hasAllowedRole) {
    return <Navigate replace to={getRoleHomePath(user.role)} />;
  }

  return <>{children}</>;
}
