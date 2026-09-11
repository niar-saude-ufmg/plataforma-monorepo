import type { Components, Theme } from "@mui/material/styles";
export const iconTheme: Components<Theme>["MuiSvgIcon"] = {
  styleOverrides: {
    root: { verticalAlign: "middle" },
  },
};
