import type { Components, Theme } from '@mui/material/styles'; import { niar } from '../../tokens/index';
export const radioTheme: Components<Theme>['MuiRadio'] = { styleOverrides: { root: { color: niar.colors.action.primary, '&.Mui-checked': { color: niar.colors.action.secondary } } } };
