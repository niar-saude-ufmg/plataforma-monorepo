import type { Components, Theme } from "@mui/material/styles";

export const headerTheme: Components<Theme>["MuiAppBar"] = {
  styleOverrides: {
    root: { backgroundColor: "#fff", color: "inherit", boxShadow: "none" },
  },
};
