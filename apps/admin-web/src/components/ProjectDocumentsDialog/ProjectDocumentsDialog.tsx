import { Dialog, IconButton, ListText } from "@niar/ui";
import type { Project, ProjectDocument } from "../../types/project.types";
import "./ProjectDocumentsDialog.scss";

type ProjectDocumentsDialogProps = {
  open: boolean;
  project: Project | null;
  downloadLoading: boolean;
  onDownload: (document: ProjectDocument) => void;
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
  downloadLoading,
  onDownload,
  onClose,
}: ProjectDocumentsDialogProps) {
  return (
    <Dialog
      open={open}
      title="Documentos do projeto"
      aria-label="Documentos do projeto selecionado"
      closeLabel="Fechar documentos"
      onClose={onClose}
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
                          onClick={() => onDownload(document)}
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
      </div>
    </Dialog>
  );
}
