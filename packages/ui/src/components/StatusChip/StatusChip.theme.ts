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
          style: {
            backgroundColor: niar.colors.feedback.successSurface,
            color: niar.colors.feedback.success,
          },
        },
        {
          props: { color: "warning" },
          style: {
            backgroundColor: niar.colors.feedback.warningSurface,
            color: niar.colors.feedback.warning,
          },
        },
        {
          props: { color: "error" },
          style: {
            backgroundColor: niar.colors.feedback.errorSurface,
            color: niar.colors.feedback.error,
          },
        },
        {
          props: { color: "info" },
          style: {
            backgroundColor: niar.colors.feedback.infoSurface,
            color: niar.colors.feedback.info,
          },
        },
      ],
    },
  },
};
