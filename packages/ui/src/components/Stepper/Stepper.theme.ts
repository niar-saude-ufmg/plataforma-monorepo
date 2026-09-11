import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";
export const stepperTheme: Components<Theme>["MuiStepIcon"] = {
  styleOverrides: {
    root: {
      "&.Mui-active, &.Mui-completed": { color: niar.colors.action.secondary },
    },
  },
};
