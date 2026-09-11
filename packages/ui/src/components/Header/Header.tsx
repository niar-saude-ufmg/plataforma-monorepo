import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import type { ReactNode } from "react";

export type HeaderProps = {
  children?: ReactNode;
  logo?: ReactNode;
};

export function Header({ children, logo }: HeaderProps) {
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
            {logo}
          </Box>
        )}
        <Box sx={{ alignItems: "center", display: "flex", flex: 1, gap: 1 }}>
          {children}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
