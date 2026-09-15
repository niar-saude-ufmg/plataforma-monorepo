import Box from "@mui/material/Box";
import MuiSkeleton from "@mui/material/Skeleton";

export type SkeletonProps = {
  variant?: "text" | "rectangular" | "rounded" | "circular";
  lines?: number;
  height?: number;
  width?: number | string;
  "aria-label"?: string;
};

export function Skeleton({
  variant = "text",
  lines = 3,
  height = 20,
  width = "100%",
  "aria-label": ariaLabel = "Carregando conteúdo",
}: SkeletonProps) {
  return (
    <Box
      sx={{ display: "grid", gap: 1, width: "100%" }}
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
    >
      {Array.from({ length: lines }, (_, index) => (
        <MuiSkeleton
          key={index}
          aria-hidden="true"
          variant={variant}
          width={variant === "circular" ? height : width}
          height={height}
          sx={{
            display: "block",
            minWidth: variant === "circular" ? height : 120,
          }}
        />
      ))}
    </Box>
  );
}
