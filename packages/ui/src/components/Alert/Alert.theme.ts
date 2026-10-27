import type { Components, Theme } from "@mui/material/styles";
import { niar } from "../../tokens/index";

const feedbackAlertStyles = {
  success: {
    main: niar.colors.feedback.success,
    surface: niar.colors.feedback.successSurface,
  },
  warning: {
    main: niar.colors.feedback.warning,
    surface: niar.colors.feedback.warningSurface,
  },
  error: {
    main: niar.colors.feedback.error,
    surface: niar.colors.feedback.errorSurface,
  },
  info: {
    main: niar.colors.feedback.info,
    surface: niar.colors.feedback.infoSurface,
  },
} as const;

const directFeedbackVariantStyles = Object.fromEntries(
  Object.entries(feedbackAlertStyles).flatMap(([severity, colors]) => [
    [
      `&.MuiAlert-standard.MuiAlert-color${severity[0].toUpperCase()}${severity.slice(1)}`,
      {
        backgroundColor: colors.surface,
        color: colors.main,
        "& .MuiAlert-icon": { color: colors.main },
      },
    ],
    [
      `&.MuiAlert-outlined.MuiAlert-color${severity[0].toUpperCase()}${severity.slice(1)}`,
      {
        borderColor: colors.main,
        color: colors.main,
        "& .MuiAlert-icon": { color: colors.main },
      },
    ],
    [
      `&.MuiAlert-filled.MuiAlert-color${severity[0].toUpperCase()}${severity.slice(1)}`,
      {
        backgroundColor: colors.main,
        color: niar.colors.neutral.white,
        "& .MuiAlert-icon": { color: niar.colors.neutral.white },
      },
    ],
  ]),
);

export const alertTheme: Components<Theme>["MuiAlert"] = {
  styleOverrides: {
    root: {
      borderRadius: niar.radius.small,
      fontFamily: niar.fontFamily,
      ...directFeedbackVariantStyles,
    },
    message: { fontSize: niar.fontSize.body },
  },
};
