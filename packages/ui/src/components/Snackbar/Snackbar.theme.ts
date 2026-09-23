import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";
export const snackbarTheme: Components<Theme>["MuiSnackbar"] = {
  styleOverrides: { root: { fontFamily: niar.fontFamily } },
};
