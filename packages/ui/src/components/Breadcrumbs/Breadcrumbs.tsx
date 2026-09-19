import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { MouseEvent, ReactNode } from "react";

export type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
};
export type BreadcrumbsProps = {
  items: readonly BreadcrumbItem[];
  "aria-label"?: string;
};

export function Breadcrumbs({
  items,
  "aria-label": ariaLabel = "Navegação estrutural",
}: BreadcrumbsProps) {
  return (
    <MuiBreadcrumbs aria-label={ariaLabel}>
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1;
        if (isCurrent)
          return (
            <Typography
              key={index}
              aria-current="page"
              color="text.primary"
              sx={{ fontWeight: 600 }}
            >
              {item.label}
            </Typography>
          );
        return (
          <Link
            key={index}
            color="inherit"
            href={item.href}
            onClick={(event: MouseEvent<HTMLAnchorElement>) => {
              if (item.onClick) {
                event.preventDefault();
                item.onClick();
              }
            }}
            underline="hover"
          >
            {item.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
}
