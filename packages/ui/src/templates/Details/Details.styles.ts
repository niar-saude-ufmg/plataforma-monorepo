import { niar } from "../../tokens/index";

export const detailsMinWidth = "min(90vw, 560px)";

export const detailsTitleStyles = {
  display: "block",
  py: niar.spacing.md,
};

export const detailsContentStyles = {
  display: "flex",
  flexDirection: "column",
  gap: niar.spacing.lg,
  "& .MuiListItem-root": {
    py: niar.spacing.sm,
  },
  "& .MuiListItem-root > .MuiBox-root": {
    gap: niar.spacing.xs,
  },
  "& .MuiList-root .MuiTypography-body1": {
    fontWeight: niar.fontWeight.regular,
  },
};
