import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Dialog } from "../../components/Dialog/Dialog";
import { ListText } from "../../components/ListText/ListText";
import { Timeline } from "../../components/Timeline/Timeline";
import { niar } from "../../tokens/index";
import { detailsMinWidth } from "./Details.styles";

export type DetailsListItem = { label: ReactNode; value: ReactNode };
export type DetailsSection = {
  title?: ReactNode;
  items: readonly DetailsListItem[];
};
export type DetailsTimelineItem = {
  title: string;
  description?: ReactNode;
  date?: ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "grey";
};

type DetailsBaseProps = {
  open: boolean;
  title?: ReactNode;
  description?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  listAriaLabel?: string;
  timelineAriaLabel?: string;
};

type DetailsListProps =
  | {
      variant?: "list";
      items: readonly DetailsListItem[];
      sections?: never;
    }
  | {
      variant?: "list";
      items?: never;
      sections: readonly DetailsSection[];
    };

type DetailsTimelineProps = {
  variant: "timeline";
  items: readonly DetailsTimelineItem[];
  sections?: never;
};

export type DetailsProps = DetailsBaseProps &
  (DetailsListProps | DetailsTimelineProps);

export function Details({
  open,
  title,
  description,
  items,
  sections,
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
      <Box sx={{ display: "flex", flexDirection: "column", gap: niar.spacing.lg }}>
        {description && (
          <Typography component="p" variant="body2" color="text.secondary" sx={{ m: 0 }}>
            {description}
          </Typography>
        )}
        {variant === "timeline" ? (
          <Timeline items={items as readonly DetailsTimelineItem[]} aria-label={timelineAriaLabel} />
        ) : sections ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: niar.spacing.xl }}>
            {sections.map((section, index) => (
              section.title ? (
                <Box
                  key={index}
                  sx={{ display: "flex", flexDirection: "column", gap: niar.spacing.md }}
                >
                  <Typography
                    component="h2"
                    variant="subtitle1"
                    sx={{ fontWeight: niar.fontWeight.semibold }}
                  >
                    {section.title}
                  </Typography>
                  <ListText
                    items={section.items}
                    dividers
                    layout="stacked"
                    aria-label={listAriaLabel}
                  />
                </Box>
              ) : (
                <ListText
                  key={index}
                  items={section.items}
                  dividers
                  layout="stacked"
                  aria-label={listAriaLabel}
                />
              )
            ))}
          </Box>
        ) : (
          <ListText
            items={items as readonly DetailsListItem[]}
            dividers
            layout="stacked"
            aria-label={listAriaLabel}
          />
        )}
      </Box>
    </Dialog>
  );
}
