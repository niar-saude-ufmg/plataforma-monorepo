import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
export type LoadingProps = {
  variant?: "circular" | "linear";
  size?: number;
  value?: number;
  "aria-label"?: string;
};
export function Loading({
  variant = "circular",
  size = 28,
  value,
  "aria-label": ariaLabel = "Carregando",
}: LoadingProps) {
  if (variant === "linear")
    return (
      <LinearProgress
        sx={{ width: "100%", minWidth: 160 }}
        variant={value === undefined ? "indeterminate" : "determinate"}
        value={value}
        aria-label={ariaLabel}
      />
    );
  return <CircularProgress size={size} aria-label={ariaLabel} />;
}
