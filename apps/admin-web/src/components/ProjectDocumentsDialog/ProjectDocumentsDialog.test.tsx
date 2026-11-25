import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Project } from "../../types/project.types";
import { ProjectDocumentsDialog } from "./ProjectDocumentsDialog";

const project: Project = {
  id: 42,
  title: "Estudo de saúde pública",
  updatedAt: "2026-10-02T12:00:00.000Z",
  researcher: {
    id: 7,
    fullName: "Maria Pesquisadora",
    email: "maria@niar.local",
  },
  status: [],
  documents: [
    {
      id: 101,
      versionNumber: 2,
      documentType: "project_docx",
      originalFilename: "projeto-v2.docx",
      createdAt: "2026-09-22T10:00:00.000Z",
    },
    {
      id: 102,
      versionNumber: 2,
      documentType: "analysis_script",
      originalFilename: "analise.py",
      createdAt: "2026-09-22T11:00:00.000Z",
    },
  ],
};

const renderDialog = ({
  downloadLoading = false,
  onDownload = vi.fn(),
  onClose = vi.fn(),
} = {}) => {
  render(
    <ProjectDocumentsDialog
      open
      project={project}
      downloadLoading={downloadLoading}
      onDownload={onDownload}
      onClose={onClose}
    />,
  );
  return { onDownload, onClose };
};

describe("ProjectDocumentsDialog", () => {
  afterEach(() => cleanup());

  it("lista os documentos e seus metadados usando ListText", () => {
    renderDialog();

    expect(
      screen.getByRole("heading", { name: "Documentos do projeto" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Estudo de saúde pública")).toBeInTheDocument();
    expect(screen.getByText("projeto-v2.docx")).toBeInTheDocument();
    expect(screen.getByText("analise.py")).toBeInTheDocument();
    expect(
      screen.getByText(/project_docx · Versão 2 · 22\/09\/2026/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Baixar projeto-v2.docx" }),
    ).toBeInTheDocument();
  });

  it("emite o documento selecionado para download", async () => {
    const user = userEvent.setup();
    const onDownload = vi.fn();
    renderDialog({ onDownload });

    await user.click(
      screen.getByRole("button", { name: "Baixar projeto-v2.docx" }),
    );

    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledWith(project.documents[0]);
  });

  it("exibe loading e desabilita os downloads enquanto a operação está pendente", () => {
    renderDialog({ downloadLoading: true });

    expect(
      screen.getByText("Baixando documento..."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Baixar projeto-v2.docx" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Baixar analise.py" }),
    ).toBeDisabled();
  });

  it("permite fechar o dialog", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDialog({ onClose });

    await user.click(
      screen.getByRole("button", { name: "Fechar documentos" }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
