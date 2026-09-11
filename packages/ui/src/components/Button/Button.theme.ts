<<<<<<< HEAD
import type { Components, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { niar } from "../../tokens/index";

export const buttonTheme: Components<Theme>["MuiButton"] = {
=======
import type { Components, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { niar } from '../../tokens/index';

export const buttonTheme: Components<Theme>['MuiButton'] = {
>>>>>>> 5ddaf0d (Build initial platform administration flow)
  defaultProps: {
    disableElevation: true,
  },
  styleOverrides: {
    root: {
      borderRadius: niar.radius.small,
      fontFamily: niar.fontFamily,
      fontWeight: niar.fontWeight.semibold,
<<<<<<< HEAD
      textTransform: "none",
      "&.Mui-focusVisible": {
=======
      textTransform: 'none',
      '&.Mui-focusVisible': {
>>>>>>> 5ddaf0d (Build initial platform administration flow)
        outline: `3px solid ${alpha(niar.colors.focus, 0.35)}`,
        outlineOffset: 2,
      },
      variants: [
        {
<<<<<<< HEAD
          props: { color: "primary", variant: "contained" },
          style: {
            backgroundColor: niar.colors.action.primary,
            color: niar.colors.action.onPrimary,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: niar.colors.brand.deep,
              boxShadow: "none",
=======
          props: { color: 'primary', variant: 'contained' },
          style: {
            backgroundColor: niar.colors.action.primary,
            color: niar.colors.action.onPrimary,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: niar.colors.brand.deep,
              boxShadow: 'none',
>>>>>>> 5ddaf0d (Build initial platform administration flow)
            },
          },
        },
        {
<<<<<<< HEAD
          props: { color: "secondary", variant: "contained" },
          style: {
            backgroundColor: niar.colors.action.secondary,
            color: niar.colors.action.onSecondary,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: niar.colors.brand.cyan,
              boxShadow: "none",
=======
          props: { color: 'secondary', variant: 'contained' },
          style: {
            backgroundColor: niar.colors.action.secondary,
            color: niar.colors.action.onSecondary,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: niar.colors.brand.cyan,
              boxShadow: 'none',
>>>>>>> 5ddaf0d (Build initial platform administration flow)
            },
          },
        },
        {
<<<<<<< HEAD
          props: { color: "primary", variant: "outlined" },
          style: {
            borderColor: niar.colors.action.primary,
            color: niar.colors.action.primary,
            "&:hover": {
=======
          props: { color: 'primary', variant: 'outlined' },
          style: {
            borderColor: niar.colors.action.primary,
            color: niar.colors.action.primary,
            '&:hover': {
>>>>>>> 5ddaf0d (Build initial platform administration flow)
              borderColor: niar.colors.action.primary,
              backgroundColor: alpha(niar.colors.action.primary, 0.08),
            },
          },
        },
        {
<<<<<<< HEAD
          props: { color: "secondary", variant: "outlined" },
          style: {
            borderColor: niar.colors.action.secondary,
            color: niar.colors.action.primary,
            "&:hover": {
=======
          props: { color: 'secondary', variant: 'outlined' },
          style: {
            borderColor: niar.colors.action.secondary,
            color: niar.colors.action.primary,
            '&:hover': {
>>>>>>> 5ddaf0d (Build initial platform administration flow)
              borderColor: niar.colors.action.secondary,
              backgroundColor: alpha(niar.colors.action.secondary, 0.08),
            },
          },
        },
        {
<<<<<<< HEAD
          props: { color: "primary", variant: "text" },
          style: {
            color: niar.colors.action.primary,
            "&:hover": {
=======
          props: { color: 'primary', variant: 'text' },
          style: {
            color: niar.colors.action.primary,
            '&:hover': {
>>>>>>> 5ddaf0d (Build initial platform administration flow)
              backgroundColor: alpha(niar.colors.action.primary, 0.08),
            },
          },
        },
        {
<<<<<<< HEAD
          props: { color: "secondary", variant: "text" },
          style: {
            color: niar.colors.action.primary,
            "&:hover": {
=======
          props: { color: 'secondary', variant: 'text' },
          style: {
            color: niar.colors.action.primary,
            '&:hover': {
>>>>>>> 5ddaf0d (Build initial platform administration flow)
              backgroundColor: alpha(niar.colors.action.secondary, 0.08),
            },
          },
        },
      ],
    },
  },
};
