import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { type ReactNode } from "react";
import { Icon, type IconName } from "../Icon/Icon";
export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: IconName | ReactNode;
};
export function EmptyState({
  title,
  description,
  action,
  icon = "folder",
}: EmptyStateProps) {
  const renderedIcon =
    typeof icon === "string" ? (
      <Icon name={icon as IconName} fontSize="large" aria-hidden="true" />
    ) : (
      icon
    );
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        py: 6,
        textAlign: "center",
      }}
    >
      {renderedIcon}
      <Typography variant="h6">{title}</Typography>
      {description && (
        <Typography color="text.secondary">{description}</Typography>
      )}
      {action}
    </Box>
  );
}
