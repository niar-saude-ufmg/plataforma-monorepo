import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";
export const statusChipTheme: Components<Theme>["MuiChip"] = {
  styleOverrides: {
    root: {
      borderRadius: niar.radius.small,
      fontFamily: niar.fontFamily,
      fontWeight: niar.fontWeight.medium,
      variants: [
        {
          props: { color: "success" },
          style: { backgroundColor: "#d9f2e6", color: "#176b4d" },
        },
        {
          props: { color: "warning" },
          style: { backgroundColor: "#fff1c2", color: "#765400" },
        },
        {
          props: { color: "error" },
          style: { backgroundColor: "#fde2e2", color: "#9b2c2c" },
        },
        {
          props: { color: "info" },
          style: { backgroundColor: "#dcecf7", color: niar.colors.action.primary },
        },
      ],
    },
  },
};
