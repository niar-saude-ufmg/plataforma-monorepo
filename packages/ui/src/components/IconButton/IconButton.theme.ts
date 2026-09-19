import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";
export const iconButtonTheme: Components<Theme>["MuiIconButton"] = {
  styleOverrides: {
    root: {
      color: niar.colors.action.primary,
      "&:hover": { backgroundColor: "rgba(63, 169, 217, 0.12)" },
      "&.Mui-focusVisible": {
        outline: `3px solid rgba(63, 169, 217, 0.35)`,
        outlineOffset: 2,
      },
    },
  },
};
