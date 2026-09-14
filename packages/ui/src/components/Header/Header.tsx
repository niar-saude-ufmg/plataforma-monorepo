import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import {
  headerAppBarStyles,
  headerContentStyles,
  headerLogoStyles,
  headerLogoWrapperStyles,
  headerToolbarStyles,
} from "./Header.styles";

export type HeaderProps = {
  children?: ReactNode;
  logo?: boolean;
  logoAlt?: string;
};

export function Header({ children, logo, logoAlt = "NIAR" }: HeaderProps) {
  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={headerAppBarStyles}
    >
      <Toolbar sx={headerToolbarStyles}>
        {logo && (
          <Box sx={headerLogoWrapperStyles}>
            <img src="/niar-logo.png" alt={logoAlt} style={headerLogoStyles} />
          </Box>
        )}
        <Box sx={headerContentStyles}>{children}</Box>
      </Toolbar>
    </AppBar>
  );
}
