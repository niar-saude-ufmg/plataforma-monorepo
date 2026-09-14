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
};

export function Details({
  open,
  title,
  items,
  variant = "list",
  onClose,
}: DetailsProps) {
  return (
    <Dialog
      open={open}
      title={title}
      onClose={onClose}
      minWidth={detailsMinWidth}
    >
      {variant === "timeline" ? (
        <Timeline items={items as readonly DetailsTimelineItem[]} />
      ) : (
        <ListText
          items={items as readonly DetailsListItem[]}
          dividers
          layout="stacked"
        />
      )}
    </Dialog>
  );
}
