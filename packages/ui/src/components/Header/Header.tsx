import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import type { ReactNode } from "react";

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
      sx={{ width: "100%" }}
    >
      <Toolbar sx={{ borderBottom: 1, borderColor: "divider", minHeight: 64 }}>
        {logo && (
          <Box sx={{ alignItems: "center", display: "flex", mr: 2 }}>
            <img
              src="/niar-logo.png"
              alt={logoAlt}
              style={{ height: 20, width: 92 }}
            />
          </Box>
        )}
        <Box sx={{ alignItems: "center", display: "flex", flex: 1, gap: 1 }}>
          {children}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
