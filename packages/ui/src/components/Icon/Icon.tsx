import type { SvgIconProps } from "@mui/material/SvgIcon";
import { forwardRef } from "react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Menu from "@mui/icons-material/Menu";
import Close from "@mui/icons-material/Close";
import Check from "@mui/icons-material/Check";
import Add from "@mui/icons-material/Add";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Search from "@mui/icons-material/Search";
import FilterList from "@mui/icons-material/FilterList";
import MoreVert from "@mui/icons-material/MoreVert";
import Settings from "@mui/icons-material/Settings";
import Person from "@mui/icons-material/Person";
import Logout from "@mui/icons-material/Logout";
import Home from "@mui/icons-material/Home";
import Dashboard from "@mui/icons-material/Dashboard";
import Folder from "@mui/icons-material/Folder";
import Description from "@mui/icons-material/Description";
import UploadFile from "@mui/icons-material/UploadFile";
import Download from "@mui/icons-material/Download";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import HelpOutline from "@mui/icons-material/HelpOutline";
export type IconName =
  | "arrowBack"
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
  arrowBack: ArrowBack,
  menu: Menu,
  close: Close,
  check: Check,
  add: Add,
  edit: Edit,
  delete: Delete,
  search: Search,
  filter: FilterList,
  moreVert: MoreVert,
  settings: Settings,
  person: Person,
  logout: Logout,
  home: Home,
  dashboard: Dashboard,
  folder: Folder,
  description: Description,
  uploadFile: UploadFile,
  download: Download,
  visibility: Visibility,
  visibilityOff: VisibilityOff,
};
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, ...props },
  ref,
) {
  const Component = icons[name] ?? HelpOutline;
  return <Component ref={ref} {...props} />;
});
