import { afterEach, describe, expect, it, vi } from "vitest";
import { getAdminApiBaseUrl, login } from "./auth-api";

describe("shell auth api", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("usa a VITE_ADMIN_API_URL quando estiver definida", () => {
    vi.stubEnv("VITE_ADMIN_API_URL", "http://localhost:3333/api/admin/");

    expect(getAdminApiBaseUrl()).toBe("http://localhost:3333/api/admin");
  });

  it("usa a origem atual quando a VITE_ADMIN_API_URL nao estiver definida", () => {
    vi.stubEnv("VITE_ADMIN_API_URL", "");

    expect(getAdminApiBaseUrl()).toBe(`${window.location.origin}/api/admin`);
  });

  it("faz login no admin-api usando a base resolvida", async () => {
    vi.stubEnv("VITE_ADMIN_API_URL", "http://localhost:3333/api/admin/");

    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "token-teste" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          id: 9,
          email: "pesquisador@plataforma.local",
          full_name: "Pesquisador Plataforma",
          role: "researcher",
          is_active: true,
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const result = await login("pesquisador@plataforma.local", "pesquisador");

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "http://localhost:3333/api/admin/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email: "pesquisador@plataforma.local", password: "pesquisador" }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3333/api/admin/auth/me",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token-teste",
        },
      },
    );

    expect(result).toEqual({
      token: "token-teste",
      user: {
        id: 9,
        email: "pesquisador@plataforma.local",
        full_name: "Pesquisador Plataforma",
        role: "researcher",
        is_active: true,
      },
    });
  });
});
