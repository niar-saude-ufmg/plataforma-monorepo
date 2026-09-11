import { ThemeProvider, type Theme } from "@mui/material/styles";
import type { PropsWithChildren } from "react";
import { niarTheme } from "./createNiarTheme";

export type NiarProviderProps = PropsWithChildren<{
  theme?: Theme;
}>;

export function NiarProvider({
  children,
  theme = niarTheme,
}: NiarProviderProps) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
