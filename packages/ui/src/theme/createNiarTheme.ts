import { createTheme, type ThemeOptions } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import { inputTheme } from "../components/Input/Input.theme";
import { buttonTheme } from "../components/Button/Button.theme";
import { cardTheme } from "../components/Card/Card.theme";
import { alertTheme } from "../components/Alert/Alert.theme";
import { iconTheme } from "../components/Icon/Icon.theme";
import { statusChipTheme } from "../components/StatusChip/StatusChip.theme";
import { checkboxTheme } from "../components/Checkbox/Checkbox.theme";
import { radioTheme } from "../components/RadioGroup/RadioGroup.theme";
import { snackbarTheme } from "../components/Snackbar/Snackbar.theme";
import { dialogTheme } from "../components/Dialog/Dialog.theme";
import { stepperTheme } from "../components/Stepper/Stepper.theme";
import { tabsTheme } from "../components/Tabs/Tabs.theme";
import { iconButtonTheme } from "../components/IconButton/IconButton.theme";
import { tabTheme } from "../components/Tabs/Tab.theme";
import { niar } from "../tokens/index";
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
    background: {
      default: niar.colors.surface.page,
      paper: niar.colors.surface.card,
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
    body1: { color: niar.colors.text.body, fontSize: niar.fontSize.body },
    body2: { color: niar.colors.text.body, fontSize: niar.fontSize.caption },
    subtitle1: {
      color: niar.colors.text.subtitle,
      fontSize: niar.fontSize.subtitle,
    },
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
    MuiSvgIcon: iconTheme,
    MuiChip: statusChipTheme,
    MuiCheckbox: checkboxTheme,
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
