import type { SxProps, Theme } from "@mui/material/styles";
import { niar } from "../../tokens";
import type { ChatVariant } from "./Chat";

export function chatSurfaceStyles(
  variant: ChatVariant,
  state: "open" | "minimized" | "maximized",
): SxProps<Theme> {
  const floating = variant === "floating";
  const maximized = floating && state === "maximized";
  return {
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden",
    bgcolor: niar.colors.surface.white,
    color: niar.colors.text.body,
    border: `${niar.borderWidth.default} solid ${niar.colors.border}`,
    borderRadius: niar.radius.medium,
    width: floating ? 440 : "100%",
    height: floating && state === "minimized" ? "auto" : 640,
    ...(floating && {
      position: "fixed",
      right: { xs: niar.spacing.xs, sm: niar.spacing.xl },
      bottom: { xs: niar.spacing.xs, sm: niar.spacing.xl },
      maxWidth: {
        xs: `calc(100vw - ${niar.spacing.md})`,
        sm: `calc(100vw - ${niar.spacing["3xl"]})`,
      },
      maxHeight: {
        xs: `calc(100dvh - ${niar.spacing.md})`,
        sm: `calc(100dvh - ${niar.spacing["3xl"]})`,
      },
      boxShadow: niar.shadow.md,
      zIndex: (theme: Theme) => theme.zIndex.drawer + 1,
    }),
    ...(maximized && {
      top: { xs: niar.spacing.xs, sm: niar.spacing.xl },
      left: { xs: niar.spacing.xs, sm: niar.spacing.xl },
      width: {
        xs: `calc(100vw - ${niar.spacing.md})`,
        sm: `calc(100vw - ${niar.spacing["3xl"]})`,
      },
      height: {
        xs: `calc(100dvh - ${niar.spacing.md})`,
        sm: `calc(100dvh - ${niar.spacing["3xl"]})`,
      },
    }),
  };
}

export const chatHeaderStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: niar.spacing.md,
  p: niar.spacing.md,
  flexShrink: 0,
  borderBottom: `${niar.borderWidth.default} solid ${niar.colors.border}`,
};

export const chatBodyStyles: SxProps<Theme> = {
  display: "flex",
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  "&[hidden]": { display: "none" },
};

export const chatBoxStyles: SxProps<Theme> = {
  flex: 1,
  width: "100%",
  minHeight: 0,
  minWidth: 0,
  height: "100%",
};
