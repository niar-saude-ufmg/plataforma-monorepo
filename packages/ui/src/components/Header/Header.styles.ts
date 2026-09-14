import { niar } from "../../tokens/index";

export const headerAppBarStyles = { width: "100%" };
export const headerToolbarStyles = {
  borderBottom: `${niar.borderWidth.default} solid ${niar.colors.border}`,
  minHeight: `calc(${niar.spacing["4xl"]} + ${niar.spacing.xs})`,
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
  height: niar.spacing["2xl"],
  width: "auto",
};
