import type { Components, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { niar } from "../../tokens/index";

export const switchTheme: Components<Theme>["MuiSwitch"] = {
  styleOverrides: {
    root: {
      height: niar.component.switch.height,
      margin: 0,
      padding: 0,
      position: "relative",
      borderRadius: `calc(${niar.component.switch.height} / 2)`,
      width: niar.component.switch.width,
      "&::before": {
        backgroundColor: alpha(niar.colors.action.primary, 0.12),
        borderRadius: `calc(${niar.component.switch.height} / 2 + ${niar.spacing["2xs"]})`,
        content: '""',
        inset: `-${niar.spacing["2xs"]}`,
        opacity: 0,
        pointerEvents: "none",
        position: "absolute",
        transition: "opacity 120ms ease",
      },
      "&:hover::before": {
        opacity: 1,
      },
      "&:has(.Mui-disabled):hover::before": {
        opacity: 0,
      },
    },
    switchBase: {
      padding: `calc((${niar.component.switch.height} - ${niar.component.switch.thumb}) / 2)`,
      zIndex: 1,
      transition: "transform 180ms ease",
      "&.Mui-checked": {
        color: niar.colors.action.primary,
        transform: `translateX(${niar.component.switch.offset})`,
        "+ .MuiSwitch-track": {
          backgroundColor: niar.colors.action.secondary,
          opacity: 1,
        },
      },
      "&.Mui-disabled": {
        color: niar.colors.neutral.white,
        "+ .MuiSwitch-track": {
          backgroundColor: niar.colors.border,
          opacity: 1,
        },
      },
    },
    thumb: {
      backgroundColor: niar.colors.neutral.white,
      boxShadow: "0 1px 3px rgba(15, 31, 91, 0.28)",
      height: niar.component.switch.thumb,
      width: niar.component.switch.thumb,
    },
    track: {
      backgroundColor: alpha(niar.colors.neutral.charcoal, 0.32),
      borderRadius: `calc(${niar.component.switch.height} / 2)`,
      opacity: 1,
    },
  },
};
