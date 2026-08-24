import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isRoleAllowedForProtectedArea } from "@niar/auth";
import { APP_ROUTES } from "@niar/config";
import { UserRole } from "@niar/contracts";

export function ProtectedRoute({
  children,
  userRole
}: {
  children: ReactNode;
  userRole?: UserRole;
}) {
  const location = useLocation();

  if (!isRoleAllowedForProtectedArea(userRole)) {
    return <Navigate replace state={{ from: location.pathname }} to={APP_ROUTES.login} />;
  }

  return <>{children}</>;
}
