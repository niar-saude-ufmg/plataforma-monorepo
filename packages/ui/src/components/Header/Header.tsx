import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import type { MouseEventHandler, ReactNode } from "react";
import {
  headerAppBarStyles,
  headerContentStyles,
  headerLogoWrapperStyles,
  headerToolbarStyles,
} from "./Header.styles";
import { Logo } from "../Logo/Logo";

export type HeaderProps = {
  children?: ReactNode;
  logo?: boolean;
  logoAlt?: string;
  logoHref?: string;
  onLogoClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function Header({
  children,
  logo,
  logoAlt = "NIAR",
  logoHref = "/",
  onLogoClick,
}: HeaderProps) {
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
            <a href={logoHref} onClick={onLogoClick} aria-label={logoAlt}>
              <Logo alt={logoAlt} />
            </a>
          </Box>
        )}
        <Box sx={headerContentStyles}>{children}</Box>
      </Toolbar>
    </AppBar>
  );
}
