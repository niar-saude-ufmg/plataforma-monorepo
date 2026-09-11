import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";
export const checkboxTheme: Components<Theme>["MuiCheckbox"] = {
  styleOverrides: {
    root: {
      color: niar.colors.action.primary,
      "&.Mui-checked": { color: niar.colors.action.secondary },
    },
  },
};
