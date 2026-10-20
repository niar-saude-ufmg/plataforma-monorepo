import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Details } from "./Details";

describe("Details", () => {
  it("renders title and detail items when open", () => {
    render(
      <Details
        open
        title="Detalhes"
        items={[{ label: "Status", value: "Em análise" }]}
      />,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Status")).toBeTruthy();
    expect(screen.getAllByText("Em análise").length).toBeGreaterThan(0);
  });

  it("calls onClose from the close button", async () => {
    const onClose = vi.fn();
    render(<Details open items={[]} onClose={onClose} />);

    screen.getByRole("button", { name: "Fechar" }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the timeline variation", () => {
    render(
      <Details
        open
        variant="timeline"
        items={[{ title: "Projeto criado" }]}
      />,
    );

    expect(screen.getByText("Projeto criado")).toBeTruthy();
  });

  it("renders the template description before the content", () => {
    render(
      <Details
        open
        title="Histórico do projeto"
        description="Estudo de saúde pública"
        variant="timeline"
        items={[]}
      />,
    );

    expect(screen.getByText("Histórico do projeto")).toBeTruthy();
    expect(screen.getByText("Estudo de saúde pública")).toBeTruthy();
  });

  it("renders grouped list sections", () => {
    render(
      <Details
        open
        title="Detalhes do pesquisador"
        sections={[
          {
            title: "Dados da conta",
            items: [{ label: "Nome completo", value: "Ana Souza" }],
          },
          {
            title: "Dados do COEP",
            items: [{ label: "CAAE", value: "12345678.9.0000.5149" }],
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Dados da conta" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Dados do COEP" })).toBeTruthy();
    expect(screen.getByText("12345678.9.0000.5149")).toBeTruthy();
  });

  it("renders a section without a heading like the legacy list", () => {
    render(
      <Details
        open
        sections={[{ items: [{ label: "Status", value: "Em análise" }] }]}
      />,
    );

    expect(screen.queryByRole("heading", { name: "Dados da conta" })).toBeNull();
    expect(screen.getAllByText("Em análise").length).toBeGreaterThan(0);
  });
});
