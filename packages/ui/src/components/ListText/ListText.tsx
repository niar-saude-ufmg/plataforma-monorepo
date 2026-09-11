import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

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
        <ListItem key={index} divider={dividers} disableGutters dense={dense}>
          <Box
            sx={{
              display: layout === "inline" ? "grid" : "flex",
              flexDirection: "column",
              gap: 0.5,
              gridTemplateColumns: "minmax(120px, 0.7fr) minmax(0, 1.3fr)",
              width: "100%",
            }}
          >
            <Typography color="text.secondary" variant="body2">
              {item.label}
            </Typography>
            <Typography
              color="text.primary"
              variant="body1"
              sx={{ fontWeight: 600 }}
            >
              {item.value}
            </Typography>
          </Box>
        </ListItem>
      ))}
    </List>
  );
}
