import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasAccessToRoute } from "@niar/auth";
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

  if (!hasAccessToRoute(userRole, location.pathname)) {
    return (
      <Navigate
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
        to={APP_ROUTES.login}
      />
    );
  }

  return <>{children}</>;
}
