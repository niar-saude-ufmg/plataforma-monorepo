import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime } from "./date";

describe("date formatters", () => {
  it("formata uma data em português usando UTC", () => {
    expect(formatDate("2026-10-02T12:00:00.000Z")).toBe("02/10/2026");
  });

  it("formata data e hora em português usando UTC", () => {
    expect(formatDateTime("2026-10-02T12:00:00.000Z")).toBe("02/10/2026, 12:00");
  });

  it("usa o fallback para valores inválidos", () => {
    expect(formatDate("invalid", { fallback: "—" })).toBe("—");
  });
});
