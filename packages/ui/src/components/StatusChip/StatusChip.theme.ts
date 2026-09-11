import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";
export const statusChipTheme: Components<Theme>["MuiChip"] = {
  styleOverrides: {
    root: {
      borderRadius: niar.radius.small,
      fontFamily: niar.fontFamily,
      fontWeight: niar.fontWeight.medium,
      variants: [
        { props: { color: 'success' }, style: { backgroundColor: '#176b4d', color: '#fff' } },
        { props: { color: 'warning' }, style: { backgroundColor: '#765400', color: '#fff' } },
        { props: { color: 'error' }, style: { backgroundColor: '#9b2c2c', color: '#fff' } },
        { props: { color: 'info' }, style: { backgroundColor: niar.colors.action.primary, color: '#fff' } },
      ],
    },
  },
};
