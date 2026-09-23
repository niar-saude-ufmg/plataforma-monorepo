import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";
export const tabTheme: Components<Theme>["MuiTab"] = {
  styleOverrides: {
    root: {
      minWidth: 0,
      paddingLeft: `calc(${niar.spacing.md} / 2)`,
      paddingRight: `calc(${niar.spacing.md} / 2)`,
      textTransform: "none",
    },
  },
};
