import type { SvgIconProps } from "@mui/material/SvgIcon";
import { forwardRef } from "react";
import InboxOutlined from "@mui/icons-material/InboxOutlined";
import Check from "@mui/icons-material/Check";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Search from "@mui/icons-material/Search";
export type IconName =
  | "inbox"
  | "check"
  | "info"
  | "warning"
  | "error"
  | "search";
export type IconProps = Omit<SvgIconProps, "children"> & { name: IconName };
const icons = {
  inbox: InboxOutlined,
  check: Check,
  info: InfoOutlined,
  warning: WarningAmberOutlined,
  error: ErrorOutline,
  search: Search,
};
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, ...props },
  ref,
) {
  const Component = icons[name];
  return <Component ref={ref} {...props} />;
});
