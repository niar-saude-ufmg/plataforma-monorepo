import "@testing-library/jest-dom";
import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Project } from "../../types/project.types";

const mocks = vi.hoisted(() => ({
  downloadProjectDocumentRequest: vi.fn(),
  downloadBlob: vi.fn(),
}));

vi.mock("../../services/projects/projects.service", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../services/projects/projects.service")
  >()),
  downloadProjectDocumentRequest: mocks.downloadProjectDocumentRequest,
}));

vi.mock("../../utils/download-file", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../utils/download-file")>()),
  downloadBlob: mocks.downloadBlob,
}));

import projectsReducer from "../../store/projects/projects.slice";
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

const makeStore = () =>
  configureStore({
    reducer: { projects: projectsReducer },
  });

const renderDialog = (onClose = vi.fn()) => {
  const store = makeStore();
  render(
    <Provider store={store}>
      <ProjectDocumentsDialog open project={project} onClose={onClose} />
    </Provider>,
  );
  return { store, onClose };
};

describe("ProjectDocumentsDialog", () => {
  beforeEach(() => {
    mocks.downloadProjectDocumentRequest.mockReset();
    mocks.downloadBlob.mockReset();
  });

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

  it("dispara o download existente com os ids do projeto e documento", async () => {
    const user = userEvent.setup();
    mocks.downloadProjectDocumentRequest.mockResolvedValue({
      blob: new Blob(["documento"]),
      filename: "projeto-v2.docx",
    });
    renderDialog();

    await user.click(
      screen.getByRole("button", { name: "Baixar projeto-v2.docx" }),
    );

    await waitFor(() =>
      expect(mocks.downloadProjectDocumentRequest).toHaveBeenCalledWith(42, 101),
    );
    expect(
      await screen.findByText("Download de projeto-v2.docx concluído."),
    ).toBeInTheDocument();
  });

  it("exibe loading e desabilita os downloads enquanto o thunk está pendente", async () => {
    const user = userEvent.setup();
    mocks.downloadProjectDocumentRequest.mockImplementation(
      () => new Promise(() => undefined),
    );
    renderDialog();

    await user.click(
      screen.getByRole("button", { name: "Baixar projeto-v2.docx" }),
    );

    expect(
      await screen.findByText("Baixando documento..."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Baixar projeto-v2.docx" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Baixar analise.py" }),
    ).toBeDisabled();
  });

  it("exibe o erro normalizado do download", async () => {
    const user = userEvent.setup();
    mocks.downloadProjectDocumentRequest.mockRejectedValue({
      status: 403,
      message: "Você não tem acesso a este documento.",
    });
    renderDialog();

    await user.click(
      screen.getByRole("button", { name: "Baixar projeto-v2.docx" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Você não tem acesso a este documento.",
    );
  });

  it("permite fechar o dialog", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDialog(onClose);

    await user.click(
      screen.getByRole("button", { name: "Fechar documentos" }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
