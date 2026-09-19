import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export type TimelineItem = {
  title: string;
  description?: ReactNode;
  date?: ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "grey";
};

export type TimelineProps = {
  items: readonly TimelineItem[];
  "aria-label"?: string;
};

export function Timeline({
  items,
  "aria-label": ariaLabel = "Linha do tempo",
}: TimelineProps) {
  return (
    <Box
      component="ol"
      aria-label={ariaLabel}
      sx={{ listStyle: "none", m: 0, p: 0 }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const color = item.color ?? "primary";
        return (
          <Box
            component="li"
            key={`${item.title}-${index}`}
            sx={{ display: "flex", minHeight: isLast ? "auto" : 88 }}
          >
            <Box
              aria-hidden="true"
              sx={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                mr: 2,
              }}
            >
              <Box
                sx={{
                  bgcolor: `${color}.main`,
                  borderRadius: "50%",
                  flexShrink: 0,
                  height: 12,
                  mt: 0.75,
                  width: 12,
                }}
              />
              {!isLast && (
                <Box sx={{ bgcolor: "divider", flex: 1, my: 0.5, width: 2 }} />
              )}
            </Box>
            <Box sx={{ pb: isLast ? 0 : 3, minWidth: 0 }}>
              {item.date && (
                <Typography color="text.secondary" variant="caption">
                  {item.date}
                </Typography>
              )}
              <Typography component="h3" variant="subtitle1">
                {item.title}
              </Typography>
              {item.description && (
                <Typography color="text.secondary" variant="body2">
                  {item.description}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
