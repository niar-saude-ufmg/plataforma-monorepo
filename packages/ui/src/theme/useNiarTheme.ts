import { useTheme, type Theme } from '@mui/material/styles';

export function useNiarTheme() {
  return useTheme<Theme>();
}
