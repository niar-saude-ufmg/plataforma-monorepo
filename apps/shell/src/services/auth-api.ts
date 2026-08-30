import { UserRole } from "@niar/contracts";

const apiUrl = import.meta.env.VITE_ASSISTENTE_API_URL || "http://localhost:8000";

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
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? "Não foi possível concluir a autenticação.");
  }

  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const token = await request<TokenResponse>("/api/auth/login/json", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  const user = await getCurrentUser(token.access_token);
  return { token: token.access_token, user };
}

export function getCurrentUser(token: string) {
  return request<AuthenticatedUser>("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
}
