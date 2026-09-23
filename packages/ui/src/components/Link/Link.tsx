import MuiLink, { type LinkProps as MuiLinkProps } from "@mui/material/Link";
import { forwardRef, type ReactNode } from "react";
import { inverseLinkStyles, linkStyles } from "./Link.styles";

export type LinkProps = MuiLinkProps & {
  inverse?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { inverse = false, startIcon, endIcon, sx, underline = "hover", children, ...props }, ref,
) {
  return (
    <MuiLink
      ref={ref}
      {...props}
      underline={underline}
      sx={{
        alignItems: "center",
        display: "inline-flex",
        gap: 0.5,
        ...(inverse ? inverseLinkStyles : linkStyles),
        textDecoration: underline === "always" ? "underline" : "none",
        "&:hover": {
          ...(inverse ? inverseLinkStyles["&:hover"] : linkStyles["&:hover"]),
          textDecoration: underline === "hover" || underline === "always" ? "underline" : "none",
        },
        ...sx,
      }}
    >
      {startIcon}
      {children}
      {endIcon}
    </MuiLink>
  );
});
