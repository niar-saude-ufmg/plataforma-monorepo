import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NiarProvider } from "@niar/ui";
import { Settings } from "./Settings";

afterEach(cleanup);

function renderSettings(path: string) {
  return render(
    <NiarProvider>
      <MemoryRouter initialEntries={[`/admin/administrador/configuracoes/${path}`]}>
        <Routes>
          <Route path="/admin/administrador/configuracoes" element={<Settings />}>
            <Route path="*" element={null} />
          </Route>
        </Routes>
      </MemoryRouter>
    </NiarProvider>,
  );
}

describe("Settings", () => {
  it("permite alternar entre as listagens", () => {
    renderSettings("artefatos-fiar");
    const artifacts = screen.getByRole("tab", { name: "Artefatos FIAR" });
    const templates = screen.getByRole("tab", { name: "Templates de projeto" });
    expect(artifacts).toBeEnabled();
    expect(templates).toBeEnabled();
    fireEvent.click(templates);
    expect(templates).toHaveAttribute("aria-selected", "true");
    expect(artifacts).toBeEnabled();
    fireEvent.click(artifacts);
    expect(artifacts).toHaveAttribute("aria-selected", "true");
  });

  it.each([
    ["artefatos-fiar/novo", "Artefatos FIAR", "Templates de projeto"],
    ["artefatos-fiar/editar/10", "Artefatos FIAR", "Templates de projeto"],
    ["templates-projeto/novo", "Templates de projeto", "Artefatos FIAR"],
    ["templates-projeto/editar/20", "Templates de projeto", "Artefatos FIAR"],
  ])("mantém apenas a aba atual habilitada em %s", (path, current, other) => {
    renderSettings(path);
    expect(screen.getByRole("tab", { name: current })).toBeEnabled();
    expect(screen.getByRole("tab", { name: current })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: other })).toBeDisabled();
    fireEvent.click(screen.getByRole("tab", { name: other }));
    expect(screen.getByRole("tab", { name: current })).toHaveAttribute("aria-selected", "true");
  });
});
