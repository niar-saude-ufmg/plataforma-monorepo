import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NiarProvider } from "../../theme/NiarProvider";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  afterEach(cleanup);

  it("renders sidebar navigation by default", async () => {
    render(
      <NiarProvider>
        <PageHeader
          sidebarItems={[
            {
              label: "Projetos",
              children: [{ label: "Meus projetos" }],
            },
          ]}
        />
      </NiarProvider>,
    );

    expect(screen.getByRole("img", { name: "NIAR" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Abrir navegação" }));
    fireEvent.click(screen.getByRole("button", { name: "Projetos" }));
    expect(screen.getByRole("button", { name: "Meus projetos" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Meus projetos" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Abrir navegação" }),
      ).toBeVisible(),
    );
  });

  it("renders menu navigation when selected", () => {
    render(
      <NiarProvider>
        <PageHeader
          navigation="menu"
          menuGroups={[{ label: "Arquivo", items: [{ label: "Abrir" }] }]}
        />
      </NiarProvider>,
    );

    expect(screen.getByRole("img", { name: "NIAR" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Arquivo" })).toBeVisible();
  });

  it("usa o callback genérico de navegação nas tabs", () => {
    const onItemChange = vi.fn();

    render(
      <NiarProvider>
        <PageHeader
          navigation="tabs"
          tabs={[{ label: "Início", value: "home" }, { label: "Projetos", value: "projects" }]}
          activeItem="home"
          onItemChange={onItemChange}
        />
      </NiarProvider>,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Projetos" }));
    expect(onItemChange).toHaveBeenCalledWith("projects");
  });
});
