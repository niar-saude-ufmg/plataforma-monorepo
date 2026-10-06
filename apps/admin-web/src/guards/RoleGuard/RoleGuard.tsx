import type { UserRole } from "@niar/contracts";
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAppSelector } from "../../store/hooks";
import { selectAuthUser } from "../../store/auth/auth.slice";
import { getRoleHomePath } from "../../routes/role-routes";

type RoleGuardProps = {
  allowedRoles: readonly UserRole[];
  children: ReactNode;
};

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const location = useLocation();
  const user = useAppSelector(selectAuthUser);

  if (!user) {
    return <Navigate replace to="/login" state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate replace to={getRoleHomePath(user.role)} />;
  }

  return <>{children}</>;
}
