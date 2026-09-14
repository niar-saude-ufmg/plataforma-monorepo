import { niar } from "../../tokens/index";

export const headerAppBarStyles = { width: "100%" };
export const headerToolbarStyles = {
  borderBottom: `${niar.borderWidth.default} solid ${niar.colors.border}`,
  minHeight: niar.spacing["4xl"],
};
export const headerLogoWrapperStyles = {
  alignItems: "center",
  display: "flex",
  mr: niar.spacing.md,
};
export const headerContentStyles = {
  alignItems: "center",
  display: "flex",
  flex: 1,
  gap: niar.spacing["2xs"],
};
export const headerLogoStyles = {
  height: niar.spacing.md,
  width: niar.spacing["4xl"],
};
