import type { Components, Theme } from '@mui/material/styles'; import { niar } from '../../tokens/index';
export const statusChipTheme: Components<Theme>['MuiChip'] = { styleOverrides: { root: { borderRadius: niar.radius.small, fontFamily: niar.fontFamily, fontWeight: niar.fontWeight.medium } } };
