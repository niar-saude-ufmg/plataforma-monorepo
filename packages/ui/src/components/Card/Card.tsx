import MuiCard, { type CardProps as MuiCardProps } from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { forwardRef, type ReactNode } from "react";

export type CardProps = Omit<MuiCardProps, "variant"> & {
  children?: ReactNode;
  /** Define a superfície com elevação ou apenas contorno. */
  variant?: "elevation" | "outlined";
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, variant = "elevation", ...props },
  ref,
) {
  return (
    <MuiCard ref={ref} variant={variant} {...props}>
      <CardContent>{children}</CardContent>
    </MuiCard>
  );
});
