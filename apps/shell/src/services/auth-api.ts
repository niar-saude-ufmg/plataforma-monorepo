import { UserRole } from "@niar/contracts";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export function getAdminApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_ADMIN_API_URL?.trim();

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/api/admin`;
  }

  return "/api/admin";
}

type TokenResponse = {
  access_token: string;
};

export type AuthenticatedUser = {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
};

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${getAdminApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? body?.detail ?? "Não foi possível concluir a autenticação.");
  }

  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const token = await request<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  const user = await getCurrentUser(token.access_token);
  return { token: token.access_token, user };
}

export function getCurrentUser(token: string) {
  return request<AuthenticatedUser>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
}
