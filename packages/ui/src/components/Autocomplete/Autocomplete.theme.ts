import type { Components, Theme } from "@mui/material/styles";
export const autocompleteTheme: Components<Theme>["MuiAutocomplete"] = {
  styleOverrides: {
    root: {
      minWidth: "min(280px, 100%)",
    },
  },
};
