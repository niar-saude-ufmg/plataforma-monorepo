import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";

export const menuTheme: Components<Theme>["MuiMenu"] = {};

export const menuTriggerStyles = {
  background: "transparent",
  border: 0,
  borderRadius: niar.radius.small,
  color: niar.colors.text.body,
  cursor: "pointer",
  fontFamily: niar.fontFamily,
  fontSize: niar.fontSize.body,
  fontWeight: niar.fontWeight.medium,
  padding: `${niar.spacing.xs} ${niar.spacing.sm}`,
  "&:hover": { backgroundColor: niar.colors.surface.page },
  '&[aria-expanded="true"]': { backgroundColor: niar.colors.border },
  "&:focus-visible": {
    outline: `${niar.borderWidth.focus} solid ${niar.colors.focus}`,
    outlineOffset: 1,
  },
};

export const menuPopupStyles = {
  background: niar.colors.surface.card,
  border: `${niar.borderWidth.default} solid ${niar.colors.border}`,
  borderRadius: niar.radius.small,
  boxShadow: niar.shadow.card,
  minWidth: 180,
  padding: niar.spacing["2xs"],
};

export const menuItemStyles = {
  alignItems: "center",
  border: 0,
  boxSizing: "border-box" as const,
  borderRadius: niar.radius.small,
  color: niar.colors.text.body,
  cursor: "pointer",
  display: "flex",
  fontFamily: niar.fontFamily,
  fontSize: niar.fontSize.body,
  fontWeight: niar.fontWeight.regular,
  padding: `${niar.spacing.xs} ${niar.spacing.sm}`,
  textAlign: "left" as const,
  width: "100%",
};
