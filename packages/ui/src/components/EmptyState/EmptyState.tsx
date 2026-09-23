import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { type ReactNode } from "react";
import { Icon, type IconName } from "../Icon/Icon";
import { emptyStateStyles } from "./EmptyState.styles";
export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: IconName | ReactNode;
  "aria-level"?: number;
};
export function EmptyState({
  title,
  description,
  action,
  icon = "folder",
  "aria-level": ariaLevel = 3,
}: EmptyStateProps) {
  const renderedIcon =
    typeof icon === "string" ? (
      <Icon name={icon as IconName} fontSize="large" aria-hidden="true" />
    ) : (
      icon
    );
  return (
    <Box sx={emptyStateStyles}>
      {renderedIcon}
      <Typography
        component="div"
        role="heading"
        aria-level={ariaLevel}
        variant="h6"
      >
        {title}
      </Typography>
      {description && (
        <Typography color="text.secondary">{description}</Typography>
      )}
      {action}
    </Box>
  );
}
