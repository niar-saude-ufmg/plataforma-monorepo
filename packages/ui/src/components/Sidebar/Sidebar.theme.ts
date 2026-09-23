import type { Components, Theme } from "@mui/material/styles";

export const sidebarTheme: Components<Theme>["MuiDrawer"] = {
  styleOverrides: {
    paper: { borderRight: "1px solid", borderColor: "divider" },
  },
};
