import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";
export const tabsTheme: Components<Theme>["MuiTabs"] = {
  styleOverrides: {
    indicator: { backgroundColor: niar.colors.action.secondary, height: 3 },
  },
};
