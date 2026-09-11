import type { Components, Theme } from '@mui/material/styles';
import { niar } from '../../tokens/index';

export const cardTheme: Components<Theme>['MuiCard'] = {
  styleOverrides: {
    root: {
      borderRadius: niar.radius.medium,
      backgroundColor: niar.colors.surface.card,
      boxShadow: '0 1px 2px rgba(15, 31, 91, 0.04), 0 4px 12px rgba(15, 31, 91, 0.04)',
    },
  },
};
