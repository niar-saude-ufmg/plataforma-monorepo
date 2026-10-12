import type { Components, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { niar } from "../../tokens/index";
export const iconButtonTheme: Components<Theme>["MuiIconButton"] = {
  styleOverrides: {
    root: {
      color: niar.colors.action.primary,
      "&:hover": { backgroundColor: alpha(niar.colors.action.primary, 0.08) },
      "&.Mui-focusVisible": {
        outline: `3px solid ${alpha(niar.colors.focus, 0.35)}`,
        outlineOffset: 2,
      },
    },
  },
};
