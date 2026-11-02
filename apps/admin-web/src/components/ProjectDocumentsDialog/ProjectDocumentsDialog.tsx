import { Dialog, IconButton, ListText, Snackbar } from "@niar/ui";
import { useState } from "react";
import { useApiError } from "../../hooks/use-api-error/use-api-error";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { downloadProjectDocument } from "../../store/projects/projects.api";
import {
  selectProjectsDownloadError,
  selectProjectsDownloadFilename,
  selectProjectsDownloadLoading,
} from "../../store/projects/projects.selectors";
import { clearProjectsError } from "../../store/projects/projects.slice";
import type { Project, ProjectDocument } from "../../types/project.types";
import "./ProjectDocumentsDialog.scss";

type ProjectDocumentsDialogProps = {
  open: boolean;
  project: Project | null;
  onClose: () => void;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Data não informada"
    : new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
};

export function ProjectDocumentsDialog({
  open,
  project,
  onClose,
}: ProjectDocumentsDialogProps) {
  const dispatch = useAppDispatch();
  const downloadLoading = useAppSelector(selectProjectsDownloadLoading);
  const downloadError = useAppSelector(selectProjectsDownloadError);
  const downloadedFilename = useAppSelector(selectProjectsDownloadFilename);
  const [dismissedFilename, setDismissedFilename] = useState<string | null>(null);

  const handleDownload = (document: ProjectDocument) => {
    if (!project) return;
    setDismissedFilename(null);
    dispatch(
      downloadProjectDocument({
        projectId: project.id,
        documentId: document.id,
      }),
    );
  };

  const handleClose = () => {
    if (downloadedFilename) setDismissedFilename(downloadedFilename);
    onClose();
  };

  const errorSnackbar = useApiError(
    downloadError,
    () => dispatch(clearProjectsError()),
    "Não foi possível baixar o documento. Tente novamente.",
  );

  const successOpen = Boolean(
    downloadedFilename && downloadedFilename !== dismissedFilename,
  );

  return (
    <>
      <Dialog
        open={open}
        title="Documentos do projeto"
        aria-label="Documentos do projeto selecionado"
        closeLabel="Fechar documentos"
        onClose={handleClose}
      >
        <div className="project-documents-dialog">
          {project?.title ? (
            <p className="project-documents-dialog__title">{project.title}</p>
          ) : null}

          {project?.documents.length ? (
            <div className="project-documents-dialog__list">
              {project.documents.map((document) => (
                <ListText
                  key={document.id}
                  dense
                  items={[
                    {
                      label: document.originalFilename,
                      value: (
                        <span className="project-documents-dialog__document">
                          <span>
                            {document.documentType} · Versão {document.versionNumber} ·{" "}
                            {formatDate(document.createdAt)}
                          </span>
                          <IconButton
                            name="download"
                            aria-label={`Baixar ${document.originalFilename}`}
                            disabled={downloadLoading}
                            onClick={() => handleDownload(document)}
                          />
                        </span>
                      ),
                    },
                  ]}
                  aria-label={`Documento ${document.originalFilename}`}
                />
              ))}
            </div>
          ) : (
            <p className="project-documents-dialog__empty">
              Nenhum documento disponível para este projeto.
            </p>
          )}

          {downloadLoading ? (
            <p className="project-documents-dialog__loading" role="status">
              Baixando documento...
            </p>
          ) : null}

          <Snackbar {...errorSnackbar} />
          <Snackbar
            open={successOpen}
            message={
              downloadedFilename
                ? `Download de ${downloadedFilename} concluído.`
                : ""
            }
            severity="success"
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            onClose={() => setDismissedFilename(downloadedFilename)}
          />
        </div>
      </Dialog>
    </>
  );
}
