import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";

export const detailsTheme: Components<Theme>["MuiDialog"] = {
  styleOverrides: {
    paper: {
      borderRadius: niar.radius.medium,
    },
  },
};
