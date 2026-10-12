import { createTheme, type ThemeOptions } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import { inputTheme } from "../components/Input/Input.theme";
import { buttonTheme } from "../components/Button/Button.theme";
import { cardTheme } from "../components/Card/Card.theme";
import { alertTheme } from "../components/Alert/Alert.theme";
import { iconTheme } from "../components/Icon/Icon.theme";
import { statusChipTheme } from "../components/StatusChip/StatusChip.theme";
import { checkboxTheme } from "../components/Checkbox/Checkbox.theme";
import { switchTheme } from "../components/Switch/Switch.theme";
import { radioTheme } from "../components/RadioGroup/RadioGroup.theme";
import { snackbarTheme } from "../components/Snackbar/Snackbar.theme";
import { dialogTheme } from "../components/Dialog/Dialog.theme";
import { stepperTheme } from "../components/Stepper/Stepper.theme";
import { tabsTheme } from "../components/Tabs/Tabs.theme";
import { iconButtonTheme } from "../components/IconButton/IconButton.theme";
import { tabTheme } from "../components/Tabs/Tab.theme";
import { niar, typographyStyle } from "../tokens/index";
import { headerTheme } from "../components/Header/Header.theme";
import { sidebarTheme } from "../components/Sidebar/Sidebar.theme";
import { breadcrumbsTheme } from "../components/Breadcrumbs/Breadcrumbs.theme";
import { avatarTheme } from "../components/Avatar/Avatar.theme";
import { menuTheme } from "../components/Menu/Menu.theme";
import { tableTheme } from "../components/Table/Table.theme";
import { paginationTheme } from "../components/Pagination/Pagination.theme";
import { autocompleteTheme } from "../components/Autocomplete/Autocomplete.theme";

const niarThemeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: niar.colors.action.primary,
      contrastText: niar.colors.action.onPrimary,
    },
    secondary: {
      main: niar.colors.action.secondary,
      contrastText: niar.colors.action.onSecondary,
    },
    success: {
      main: niar.colors.feedback.success,
      light: niar.colors.feedback.successSurface,
      contrastText: niar.colors.neutral.white,
    },
    warning: {
      main: niar.colors.feedback.warning,
      light: niar.colors.feedback.warningSurface,
      contrastText: niar.colors.neutral.white,
    },
    error: {
      main: niar.colors.feedback.error,
      light: niar.colors.feedback.errorSurface,
      contrastText: niar.colors.neutral.white,
    },
    info: {
      main: niar.colors.feedback.info,
      light: niar.colors.feedback.infoSurface,
      contrastText: niar.colors.neutral.white,
    },
    background: {
      default: niar.colors.surface.light,
      paper: niar.colors.surface.white,
    },
    text: {
      primary: niar.colors.text.body,
      secondary: niar.colors.text.subtitle,
    },
    divider: niar.colors.border,
  },
  typography: {
    fontFamily: niar.fontFamily,
    fontWeightRegular: niar.fontWeight.regular,
    fontWeightMedium: niar.fontWeight.medium,
    fontWeightBold: niar.fontWeight.bold,
    body1: { ...typographyStyle("body"), color: niar.colors.text.body },
    body2: { ...typographyStyle("caption"), color: niar.colors.text.body },
    subtitle1: {
      ...typographyStyle("subtitle"),
      color: niar.colors.text.subtitle,
    },
    h1: { ...typographyStyle("heading"), color: niar.colors.text.heading },
    h2: { ...typographyStyle("title"), color: niar.colors.text.heading },
  },
  spacing: Number.parseFloat(niar.spacing.xs),
  shape: { borderRadius: Number.parseFloat(niar.radius.small) },
  components: {
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: niar.colors.surface.white,
        },
        input: {
          backgroundColor: niar.colors.surface.white,
        },
      },
    },
    MuiButton: buttonTheme,
    MuiOutlinedInput: inputTheme,
    MuiCard: cardTheme,
    MuiAlert: alertTheme,
    MuiSvgIcon: iconTheme,
    MuiChip: statusChipTheme,
    MuiCheckbox: checkboxTheme,
    MuiSwitch: switchTheme,
    MuiRadio: radioTheme,
    MuiSnackbar: snackbarTheme,
    MuiDialog: dialogTheme,
    MuiStepIcon: stepperTheme,
    MuiTabs: tabsTheme,
    MuiIconButton: iconButtonTheme,
    MuiTab: tabTheme,
    MuiAppBar: headerTheme,
    MuiDrawer: sidebarTheme,
    MuiBreadcrumbs: breadcrumbsTheme,
    MuiAvatar: avatarTheme,
    MuiMenu: menuTheme,
    MuiTable: tableTheme,
    MuiPagination: paginationTheme,
    MuiAutocomplete: autocompleteTheme,
  },
};

export function createNiarTheme(overrides: ThemeOptions = {}) {
  return createTheme(deepmerge(niarThemeOptions, overrides));
}

export const niarTheme = createNiarTheme();
