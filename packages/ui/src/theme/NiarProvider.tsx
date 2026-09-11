<<<<<<< HEAD
import { ThemeProvider, type Theme } from "@mui/material/styles";
import type { PropsWithChildren } from "react";
import { niarTheme } from "./createNiarTheme";
=======
import { ThemeProvider, type Theme } from '@mui/material/styles';
import type { PropsWithChildren } from 'react';
import { niarTheme } from './createNiarTheme';
>>>>>>> 5ddaf0d (Build initial platform administration flow)

export type NiarProviderProps = PropsWithChildren<{
  theme?: Theme;
}>;

<<<<<<< HEAD
export function NiarProvider({
  children,
  theme = niarTheme,
}: NiarProviderProps) {
=======
export function NiarProvider({ children, theme = niarTheme }: NiarProviderProps) {
>>>>>>> 5ddaf0d (Build initial platform administration flow)
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
