import { APP_ROUTES } from "@niar/config";
import { UserRole } from "@niar/contracts";

export const SESSION_STORAGE_KEY = "niar.platform.session";
export const ACCESS_TOKEN_STORAGE_KEY = "token";
export const SESSION_CHANGED_EVENT = "niar:session-changed";
export const defaultUserRole: UserRole = "researcher";

export type PlatformSessionUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
};

export const isProtectedRoute = (pathname: string) =>
  pathname.startsWith(APP_ROUTES.admin) ||
  pathname.startsWith(APP_ROUTES.assistant);

export const isRoleAllowedForProtectedArea = (role?: UserRole) => Boolean(role);

export const hasAccessToRoute = (role: UserRole | undefined, pathname: string) => {
  if (!isProtectedRoute(pathname)) {
    return true;
  }

  if (!role) {
    return false;
  }

  if (pathname.startsWith(APP_ROUTES.admin)) {
    return Boolean(role);
  }

  if (pathname.startsWith(APP_ROUTES.assistant)) {
    return role === "admin" || role === "researcher";
  }

  return true;
};

export const notifySessionChanged = () => {
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
};

export const readPlatformSession = (): PlatformSessionUser | null => {
  if (!window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PlatformSessionUser;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

export const writePlatformSession = (user: PlatformSessionUser) => {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  notifySessionChanged();
};

export const clearPlatformSession = () => {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  notifySessionChanged();
};
