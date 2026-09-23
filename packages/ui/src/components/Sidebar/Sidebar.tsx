import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import type { ReactNode } from "react";
import { useState } from "react";
import { niar } from "../../tokens/index";

const sidebarItemIndents = [
  niar.spacing.md,
  niar.spacing["2xl"],
  niar.spacing["3xl"],
];

export type SidebarItem = {
  label: string;
  value?: string;
  icon?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: readonly SidebarItem[];
};

export type SidebarProps = {
  items: readonly SidebarItem[];
  open?: boolean;
  onClose?: () => void;
  variant?: "permanent" | "persistent" | "temporary";
  width?: number;
  closeLabel?: string;
  "aria-label"?: string;
};

export function Sidebar({
  items,
  open = true,
  onClose,
  variant = "temporary",
  width = 280,
  closeLabel = "Fechar menu",
  "aria-label": ariaLabel = "Navegação principal",
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
          aria-label={closeLabel}
          onClick={onClose}
          sx={{ alignSelf: "flex-end", m: 1 }}
        >
          <ChevronLeft />
        </IconButton>
      )}
      <List aria-label={ariaLabel}>
        {items.map((item) => (
          <SidebarItemView key={item.label} item={item} />
        ))}
      </List>
    </Drawer>
  );
}

function SidebarItemView({
  item,
  level = 0,
}: {
  item: SidebarItem;
  level?: number;
}) {
  const hasChildren = Boolean(item.children?.length);
  const [expanded, setExpanded] = useState(
    item.selected || item.children?.some((child) => child.selected) || false,
  );

  return (
    <>
      <ListItemButton
        selected={item.selected}
        disabled={item.disabled}
        onClick={() => {
          item.onClick?.();
          if (hasChildren) setExpanded((open) => !open);
        }}
        sx={{ pl: sidebarItemIndents[Math.min(level, sidebarItemIndents.length - 1)] }}
        aria-expanded={hasChildren ? expanded : undefined}
      >
        {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
        <ListItemText primary={item.label} />
        {hasChildren && (expanded ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>
      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {item.children?.map((child) => (
            <SidebarItemView key={child.label} item={child} level={level + 1} />
          ))}
        </Collapse>
      )}
    </>
  );
}
