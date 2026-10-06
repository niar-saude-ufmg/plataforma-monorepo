import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tabs } from "./Tabs";
describe("Tabs", () => {
  it("renderiza as opções", () => {
    render(
      <Tabs
        value="one"
        options={[
          { value: "one", label: "Uma" },
          { value: "two", label: "Duas" },
        ]}
      />,
    );
    expect(screen.getByRole("tab", { name: "Uma" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Duas" })).toBeVisible();
  });

  it("renderiza qualquer quantidade de opções", () => {
    render(
      <Tabs
        value="home"
        options={[
          { value: "home", label: "Início" },
          { value: "projects", label: "Projetos" },
          { value: "users", label: "Usuários" },
          { value: "specialties", label: "Especialidades" },
          { value: "profile", label: "Perfil" },
        ]}
      />,
    );

    const tablist = screen.getAllByRole("tablist")[1];
    expect(tablist.querySelectorAll('[role="tab"]')).toHaveLength(5);
    expect(screen.getByRole("tab", { name: "Perfil" })).toBeVisible();
  });
});
