import { afterEach, describe, expect, it, vi } from "vitest";
import { getAdminApiBaseUrl } from "./auth.service";

describe("auth service", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("usa a VITE_ADMIN_API_URL quando ela estiver definida", () => {
    vi.stubEnv("VITE_ADMIN_API_URL", "http://localhost:3333/api/admin/");

    expect(getAdminApiBaseUrl()).toBe("http://localhost:3333/api/admin");
  });

  it("usa a origem atual quando a VITE_ADMIN_API_URL não estiver definida", () => {
    vi.stubEnv("VITE_ADMIN_API_URL", "");

    expect(getAdminApiBaseUrl()).toBe(`${window.location.origin}/api/admin`);
  });
});
