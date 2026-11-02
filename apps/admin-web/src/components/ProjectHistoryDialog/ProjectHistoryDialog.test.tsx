import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Project } from "../../types/project.types";
import { ProjectHistoryDialog } from "./ProjectHistoryDialog";

const project: Project = {
  id: 42,
  title: "Estudo de saúde pública",
  updatedAt: "2026-10-02T12:00:00.000Z",
  researcher: {
    id: 7,
    fullName: "Maria Pesquisadora",
    email: "maria@niar.local",
  },
  documents: [],
  status: [
    {
      code: "submitted_for_review",
      label: "Enviado para avaliação",
      versionNumber: 1,
      createdAt: "2026-09-20T10:00:00.000Z",
      notes: "Projeto submetido pelo pesquisador",
    },
    {
      code: "needs_changes",
      label: "Precisa de alterações",
      versionNumber: 1,
      createdAt: "2026-09-21T11:30:00.000Z",
      notes: null,
    },
  ],
};

describe("ProjectHistoryDialog", () => {
  it("exibe a timeline do projeto selecionado com status, data e complemento", () => {
    render(
      <ProjectHistoryDialog open project={project} onClose={vi.fn()} />,
    );

    expect(
      screen.getByRole("heading", { name: "Histórico do projeto" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Estudo de saúde pública")).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "Histórico de status do projeto" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Enviado para avaliação")).toBeInTheDocument();
    expect(screen.getByText("Precisa de alterações")).toBeInTheDocument();
    expect(
      screen.getByText("Projeto submetido pelo pesquisador · Versão 1"),
    ).toBeInTheDocument();
    expect(screen.getByText("Versão 1")).toBeInTheDocument();
    expect(screen.getByText("20/09/2026, 10:00")).toBeInTheDocument();
  });

  it("fecha o dialog pelo botão do template Details", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ProjectHistoryDialog open project={project} onClose={onClose} />);

    await user.click(
      screen.getByRole("button", { name: "Fechar histórico" }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
