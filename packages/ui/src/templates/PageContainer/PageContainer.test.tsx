import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NiarProvider } from "../../theme/NiarProvider";
import { PageContainer } from "./PageContainer";

describe("PageContainer", () => {
  afterEach(cleanup);

  it("renderiza o conteúdo em main", () => {
    render(<NiarProvider><PageContainer><p>Conteúdo</p></PageContainer></NiarProvider>);
    expect(screen.getByRole("main").textContent).toContain("Conteúdo");
  });

  it("permite controlar a aba ativa e propaga a navegação", () => {
    const onTabChange = vi.fn();

    render(
      <NiarProvider>
        <PageContainer
          tabs={[{ label: "Início", value: "/inicio" }, { label: "Projetos", value: "/projetos" }]}
          activeItem="/inicio"
          onItemChange={onTabChange}
        />
      </NiarProvider>,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Projetos" }));
    expect(onTabChange).toHaveBeenCalledWith("/projetos");
  });
});
