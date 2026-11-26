import { PROJECT_STATUS_LABELS } from "@niar/contracts";
import { Details, type DetailsTimelineItem } from "@niar/ui";
import type { Project } from "../../types/project.types";
import { formatDateTime } from "../../utils/formatters/date";

type ProjectHistoryDialogProps = {
  open: boolean;
  project: Project | null;
  onClose: () => void;
};

const toTimelineItem = (
  entry: Project["status"][number],
): DetailsTimelineItem => ({
  title: PROJECT_STATUS_LABELS[entry.code] ?? entry.label,
  date: formatDateTime(entry.createdAt),
  description: entry.notes
    ? `${entry.notes} · Versão ${entry.versionNumber}`
    : `Versão ${entry.versionNumber}`,
});

export function ProjectHistoryDialog({
  open,
  project,
  onClose,
}: ProjectHistoryDialogProps) {
  return (
    <Details
      open={open}
      title="Histórico do projeto"
      description={project?.title}
      variant="timeline"
      items={project?.status.map(toTimelineItem) ?? []}
      timelineAriaLabel="Histórico de status do projeto"
      closeLabel="Fechar histórico"
      onClose={onClose}
    />
  );
}
