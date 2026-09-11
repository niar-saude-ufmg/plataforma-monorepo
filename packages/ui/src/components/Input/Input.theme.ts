import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";

export const inputTheme: Components<Theme>["MuiOutlinedInput"] = {
  styleOverrides: {
    root: {
      borderRadius: niar.radius.small,
      fontFamily: niar.fontFamily,
      backgroundColor: niar.colors.surface.card,
    },
    notchedOutline: { borderColor: 'rgba(28, 53, 94, 0.24)', borderWidth: niar.borderWidth.default },
  },
};
