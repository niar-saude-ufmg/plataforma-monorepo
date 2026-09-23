import type { Components, Theme } from "@mui/material/styles";
export const paginationTheme: Components<Theme>["MuiPagination"] = {
  styleOverrides: {
    root: {
      minWidth: 320,
    },
    ul: {
      justifyContent: "center",
    },
  },
};
