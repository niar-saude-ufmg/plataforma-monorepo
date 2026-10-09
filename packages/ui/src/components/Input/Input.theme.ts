import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";

export const inputTheme: Components<Theme>["MuiOutlinedInput"] = {
  styleOverrides: {
    root: {
      borderRadius: niar.radius.small,
      fontFamily: niar.fontFamily,
      backgroundColor: niar.colors.surface.white,
    },
    notchedOutline: {
      borderColor: niar.colors.border,
      borderWidth: niar.borderWidth.default,
    },
  },
};
