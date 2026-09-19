import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";
export const textareaTheme: Components<Theme>["MuiTextField"] = {
  styleOverrides: { root: { fontFamily: niar.fontFamily } },
};
