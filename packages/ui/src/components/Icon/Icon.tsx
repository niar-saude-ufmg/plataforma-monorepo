import type { SvgIconProps } from "@mui/material/SvgIcon";
import { forwardRef } from "react";
import * as MuiIcons from "@mui/icons-material";
export type IconName =
  | "menu"
  | "close"
  | "check"
  | "add"
  | "edit"
  | "delete"
  | "search"
  | "filter"
  | "moreVert"
  | "settings"
  | "person"
  | "logout"
  | "home"
  | "dashboard"
  | "folder"
  | "description"
  | "uploadFile"
  | "download"
  | "visibility"
  | "visibilityOff";
export type IconProps = Omit<SvgIconProps, "children"> & { name: IconName };
const icons = {
  menu: MuiIcons.Menu,
  close: MuiIcons.Close,
  check: MuiIcons.Check,
  add: MuiIcons.Add,
  edit: MuiIcons.Edit,
  delete: MuiIcons.Delete,
  search: MuiIcons.Search,
  filter: MuiIcons.FilterList,
  moreVert: MuiIcons.MoreVert,
  settings: MuiIcons.Settings,
  person: MuiIcons.Person,
  logout: MuiIcons.Logout,
  home: MuiIcons.Home,
  dashboard: MuiIcons.Dashboard,
  folder: MuiIcons.Folder,
  description: MuiIcons.Description,
  uploadFile: MuiIcons.UploadFile,
  download: MuiIcons.Download,
  visibility: MuiIcons.Visibility,
  visibilityOff: MuiIcons.VisibilityOff,
};
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, ...props },
  ref,
) {
  const Component = icons[name] ?? MuiIcons.HelpOutline;
  return <Component ref={ref} {...props} />;
});
