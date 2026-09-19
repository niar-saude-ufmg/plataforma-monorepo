import type { Components, Theme } from "@mui/material/styles";
export const autocompleteTheme: Components<Theme>["MuiAutocomplete"] = {
  styleOverrides: {
    root: {
      minWidth: 280,
    },
  },
};
