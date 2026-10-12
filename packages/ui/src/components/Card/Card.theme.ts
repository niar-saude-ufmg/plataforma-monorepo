import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";

export const cardTheme: Components<Theme>["MuiCard"] = {
  styleOverrides: {
    root: {
      borderRadius: niar.radius.medium,
      backgroundColor: niar.colors.surface.white,
      boxShadow: niar.shadow.md,
      ".MuiCardContent-root": {
        padding: niar.spacing.md,
        "&:last-child": {
          paddingBottom: niar.spacing.md,
        },
      },
    },
  },
};
