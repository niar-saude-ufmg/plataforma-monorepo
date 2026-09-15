import type { ReactNode } from "react";
import { Dialog } from "../../components/Dialog/Dialog";
import {
  ListText,
} from "../../components/ListText/ListText";
import {
  Timeline,
} from "../../components/Timeline/Timeline";
import { detailsMinWidth } from "./Details.styles";

export type DetailsListItem = { label: ReactNode; value: ReactNode };
export type DetailsTimelineItem = {
  title: string;
  description?: ReactNode;
  date?: ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "grey";
};

export type DetailsProps = {
  open: boolean;
  title?: ReactNode;
  items: readonly (DetailsListItem | DetailsTimelineItem)[];
  variant?: "list" | "timeline";
  onClose?: () => void;
  closeLabel?: string;
  listAriaLabel?: string;
  timelineAriaLabel?: string;
};

export function Details({
  open,
  title,
  items,
  variant = "list",
  onClose,
  closeLabel = "Fechar",
  listAriaLabel = "Detalhes",
  timelineAriaLabel = "Linha do tempo",
}: DetailsProps) {
  return (
    <Dialog
      open={open}
      title={title}
      onClose={onClose}
      closeLabel={closeLabel}
      minWidth={detailsMinWidth}
    >
      {variant === "timeline" ? (
        <Timeline items={items as readonly DetailsTimelineItem[]} aria-label={timelineAriaLabel} />
      ) : (
        <ListText
          items={items as readonly DetailsListItem[]}
          dividers
          layout="stacked"
          aria-label={listAriaLabel}
        />
      )}
    </Dialog>
  );
}
