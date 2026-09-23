import { niar } from "../../tokens/index";

export const statusChipColors = {
  success: niar.colors.feedback.success,
  warning: niar.colors.feedback.warning,
  error: niar.colors.feedback.error,
  info: niar.colors.feedback.info,
} as const;

export const statusChipTextStyles = {
  backgroundColor: "transparent",
  border: 0,
  height: "auto",
  minWidth: 0,
  padding: niar.spacing.none,
  "& .MuiChip-label": { padding: niar.spacing.none },
};
