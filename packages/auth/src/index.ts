import { APP_ROUTES } from "@niar/config";
import { UserRole } from "@niar/contracts";

export const SESSION_STORAGE_KEY = "niar.platform.session";
export const defaultUserRole: UserRole = "researcher";

export const isProtectedRoute = (pathname: string) =>
  pathname.startsWith(APP_ROUTES.admin) || pathname.startsWith(APP_ROUTES.assistant);

export const isRoleAllowedForProtectedArea = (role?: UserRole) => Boolean(role);

export const hasAccessToRoute = (role: UserRole | undefined, pathname: string) => {
  if (!isProtectedRoute(pathname)) {
    return true;
  }

  if (!role) {
    return false;
  }

  if (pathname.startsWith(APP_ROUTES.admin)) {
    return role === "admin" || role === "committee" || role === "researcher";
  }

  if (pathname.startsWith(APP_ROUTES.assistant)) {
    return role === "admin" || role === "researcher";
  }

  return true;
};
