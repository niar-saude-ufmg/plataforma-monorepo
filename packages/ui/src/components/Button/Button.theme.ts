import type { Components, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { niar } from "../../tokens/index";

export const buttonTheme: Components<Theme>["MuiButton"] = {
  defaultProps: {
    disableElevation: true,
  },
  styleOverrides: {
    root: {
      borderRadius: niar.radius.small,
      fontFamily: niar.fontFamily,
      fontWeight: niar.fontWeight.semibold,
      textTransform: "none",
      "&.Mui-focusVisible": {
        outline: `3px solid ${alpha(niar.colors.focus, 0.35)}`,
        outlineOffset: 2,
      },
      variants: [
        {
          props: { color: "inverse", variant: "contained" },
          style: {
            backgroundColor: niar.colors.surface.card,
            border: `${niar.borderWidth.default} solid ${niar.colors.surface.card}`,
            color: niar.colors.brand.deep,
            "&:hover": { backgroundColor: alpha(niar.colors.surface.card, 0.82) },
          },
        },
        {
          props: { color: "inverse", variant: "outlined" },
          style: {
            backgroundColor: "transparent",
            borderColor: niar.colors.surface.card,
            color: niar.colors.surface.card,
            "&:hover": { backgroundColor: alpha(niar.colors.surface.card, 0.12) },
          },
        },
        {
          props: { color: "inverse", variant: "text" },
          style: {
            color: niar.colors.surface.card,
            "&:hover": { backgroundColor: alpha(niar.colors.surface.card, 0.12) },
          },
        },
        {
          props: { variant: "inverse" },
          style: {
            backgroundColor: niar.colors.surface.card,
            color: niar.colors.brand.deep,
            "&:hover": { backgroundColor: alpha(niar.colors.surface.card, 0.82) },
          },
        },
        {
          props: { color: "primary", variant: "contained" },
          style: {
            backgroundColor: niar.colors.action.primary,
            color: niar.colors.action.onPrimary,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: alpha(niar.colors.action.primary, 0.85),
              boxShadow: "none",
            },
          },
        },
        {
          props: { color: "secondary", variant: "contained" },
          style: {
            backgroundColor: niar.colors.action.secondary,
            color: niar.colors.action.onSecondary,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: alpha(niar.colors.action.secondary, 0.85),
              boxShadow: "none",
            },
          },
        },
        {
          props: { color: "primary", variant: "outlined" },
          style: {
            borderColor: niar.colors.action.primary,
            color: niar.colors.action.primary,
            "&:hover": {
              borderColor: niar.colors.action.primary,
              backgroundColor: alpha(niar.colors.action.primary, 0.08),
            },
          },
        },
        {
          props: { color: "secondary", variant: "outlined" },
          style: {
            borderColor: niar.colors.action.secondary,
            color: niar.colors.action.primary,
            "&:hover": {
              borderColor: niar.colors.action.secondary,
              backgroundColor: alpha(niar.colors.action.secondary, 0.08),
            },
          },
        },
        {
          props: { color: "primary", variant: "text" },
          style: {
            color: niar.colors.action.primary,
            "&:hover": {
              backgroundColor: alpha(niar.colors.action.primary, 0.08),
            },
          },
        },
        {
          props: { color: "secondary", variant: "text" },
          style: {
            color: niar.colors.action.primary,
            "&:hover": {
              backgroundColor: alpha(niar.colors.action.secondary, 0.08),
            },
          },
        },
        {
          props: { color: "danger", variant: "contained" },
          style: {
            backgroundColor: niar.colors.feedback.error,
            color: niar.colors.neutral.white,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: alpha(niar.colors.feedback.error, 0.85),
              boxShadow: "none",
            },
          },
        },
        {
          props: { color: "danger", variant: "outlined" },
          style: {
            borderColor: alpha(niar.colors.feedback.error, 0.8),
            color: alpha(niar.colors.feedback.error, 0.8),
            "&:hover": {
              backgroundColor: alpha(niar.colors.feedback.error, 0.08),
              borderColor: alpha(niar.colors.feedback.error, 0.8),
            },
          },
        },
        {
          props: { color: "danger", variant: "text" },
          style: {
            color: alpha(niar.colors.feedback.error, 0.8),
            "&:hover": {
              backgroundColor: alpha(niar.colors.feedback.error, 0.08),
            },
          },
        },
      ],
    },
  },
};
