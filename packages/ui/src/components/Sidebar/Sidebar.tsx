import ChevronLeft from "@mui/icons-material/ChevronLeft";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import type { ReactNode } from "react";

export type SidebarItem = {
  label: string;
  icon?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export type SidebarProps = {
  items: readonly SidebarItem[];
  open?: boolean;
  onClose?: () => void;
  variant?: "permanent" | "persistent" | "temporary";
  width?: number;
};

export function Sidebar({
  items,
  open = true,
  onClose,
  variant = "temporary",
  width = 280,
}: SidebarProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      variant={variant}
      slotProps={{ paper: { sx: { width } } }}
      ModalProps={{ keepMounted: true }}
    >
      {variant !== "permanent" && (
        <IconButton
          aria-label="Fechar menu"
          onClick={onClose}
          sx={{ alignSelf: "flex-end", m: 1 }}
        >
          <ChevronLeft />
        </IconButton>
      )}
      <List aria-label="Navegação principal">
        {items.map((item) => (
          <ListItemButton
            key={item.label}
            selected={item.selected}
            disabled={item.disabled}
            onClick={item.onClick}
          >
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
