import type { Components, Theme } from '@mui/material/styles';
import { niar } from '../../tokens/index';

export const alertTheme: Components<Theme>['MuiAlert'] = {
  styleOverrides: {
    root: { borderRadius: niar.radius.small, fontFamily: niar.fontFamily },
    message: { fontSize: niar.fontSize.body },
  },
};
