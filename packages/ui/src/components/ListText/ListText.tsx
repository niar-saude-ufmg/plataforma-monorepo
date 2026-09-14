import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { listTextLayoutStyles, listTextValueStyles } from "./ListText.styles";

export type ListTextItem = {
  label: ReactNode;
  value: ReactNode;
};

export type ListTextProps = {
  items: readonly ListTextItem[];
  dense?: boolean;
  dividers?: boolean;
  layout?: "stacked" | "inline";
};

export function ListText({
  items,
  dense = false,
  dividers = false,
  layout = "stacked",
}: ListTextProps) {
  return (
    <List aria-label="Detalhes" disablePadding>
      {items.map((item, index) => (
        <ListItem
          key={index}
          divider={dividers && index < items.length - 1}
          disableGutters
          dense={dense}
        >
          <Box
            sx={{
              ...listTextLayoutStyles,
              display: layout === "inline" ? "grid" : "flex",
            }}
          >
            <Typography color="text.secondary" variant="body2">
              {item.label}
            </Typography>
            <Typography
              color="text.primary"
              variant="body1"
              sx={listTextValueStyles}
            >
              {item.value}
            </Typography>
          </Box>
        </ListItem>
      ))}
    </List>
  );
}
