import Chip, { type ChipProps } from "@mui/material/Chip";
import { forwardRef } from "react";

export type StatusChipStatus =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "error";
export type StatusChipProps = Omit<ChipProps, "color"> & {
  status?: StatusChipStatus;
  display?: "chip" | "text";
};

export const StatusChip = forwardRef<HTMLDivElement, StatusChipProps>(
  function StatusChip({ status = "default", display = "chip", sx, ...props }, ref) {
    return (
      <Chip
        ref={ref}
        color={status === "default" ? "default" : status}
        sx={
          display === "text"
            ? {
                height: "auto",
                minWidth: 0,
                padding: 0,
                backgroundColor: "transparent",
                color:
                  status === "success"
                    ? "#176b4d"
                    : status === "warning"
                      ? "#765400"
                      : status === "error"
                        ? "#9b2c2c"
                        : status === "info"
                          ? "#1c355e"
                          : "inherit",
                border: 0,
                "& .MuiChip-label": { padding: 0 },
                ...sx,
              }
            : sx
        }
        {...props}
      />
    );
  },
);
