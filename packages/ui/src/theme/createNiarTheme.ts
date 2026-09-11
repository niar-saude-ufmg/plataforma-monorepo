import { createTheme, type ThemeOptions } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import { inputTheme } from '../components/Input/Input.theme';
import { buttonTheme } from '../components/Button/Button.theme';
import { cardTheme } from '../components/Card/Card.theme';
import { alertTheme } from '../components/Alert/Alert.theme';
import { niar } from '../tokens/index';

const niarThemeOptions: ThemeOptions = {
  palette: {
    primary: { main: niar.colors.action.primary, contrastText: niar.colors.action.onPrimary },
    secondary: { main: niar.colors.action.secondary, contrastText: niar.colors.action.onSecondary },
    background: { default: niar.colors.surface.page, paper: niar.colors.surface.card },
    text: { primary: niar.colors.text.body, secondary: niar.colors.text.subtitle },
    divider: niar.colors.border,
  },
  typography: {
    fontFamily: niar.fontFamily,
    fontWeightRegular: niar.fontWeight.regular,
    fontWeightMedium: niar.fontWeight.medium,
    fontWeightBold: niar.fontWeight.bold,
    body1: { color: niar.colors.text.body, fontSize: niar.fontSize.body },
    body2: { color: niar.colors.text.body, fontSize: niar.fontSize.caption },
    subtitle1: { color: niar.colors.text.subtitle, fontSize: niar.fontSize.subtitle },
    h1: { color: niar.colors.text.heading, fontSize: niar.fontSize.heading },
    h2: { color: niar.colors.text.heading, fontSize: niar.fontSize.title },
  },
  spacing: Number.parseFloat(niar.spacing.xs),
  shape: { borderRadius: Number.parseFloat(niar.radius.small) },
  components: {
    MuiButton: buttonTheme,
    MuiOutlinedInput: inputTheme,
    MuiCard: cardTheme,
    MuiAlert: alertTheme,
  },
};

export function createNiarTheme(overrides: ThemeOptions = {}) {
  return createTheme(deepmerge(niarThemeOptions, overrides));
}

export const niarTheme = createNiarTheme();
