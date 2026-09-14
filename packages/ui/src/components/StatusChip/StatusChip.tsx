import Chip, { type ChipProps } from "@mui/material/Chip";
import { forwardRef } from "react";
import { statusChipColors, statusChipTextStyles } from "./StatusChip.styles";

export type StatusChipStatus =
  "default" | "info" | "success" | "warning" | "error";
export type StatusChipProps = Omit<ChipProps, "color"> & {
  status?: StatusChipStatus;
  display?: "chip" | "text";
};

export const StatusChip = forwardRef<HTMLDivElement, StatusChipProps>(
  function StatusChip(
    { status = "default", display = "chip", sx, ...props },
    ref,
  ) {
    return (
      <Chip
        ref={ref}
        color={status === "default" ? "default" : status}
        sx={
          display === "text"
            ? {
                ...statusChipTextStyles,
                color:
                  status === "default" ? "inherit" : statusChipColors[status],
                ...sx,
              }
            : sx
        }
        {...props}
      />
    );
  },
);
