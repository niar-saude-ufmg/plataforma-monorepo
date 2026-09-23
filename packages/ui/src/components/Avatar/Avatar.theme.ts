import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";

export const avatarTheme: Components<Theme>["MuiAvatar"] = {
  styleOverrides: {
    root: {
      backgroundColor: niar.colors.action.primary,
      color: niar.colors.action.onPrimary,
      fontWeight: niar.fontWeight.semibold,
    },
  },
};
