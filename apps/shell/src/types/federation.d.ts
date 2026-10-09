declare module "admin/App" {
  import { ComponentType } from "react";
  import type { PlatformSessionUser } from "@niar/auth";

  const AdminApp: ComponentType<{
    mode?: "admin" | "public";
    currentUser?: PlatformSessionUser;
  }>;
  export default AdminApp;
}

declare module "assistant/App" {
  import { ComponentType } from "react";

  const AssistantApp: ComponentType;
  export default AssistantApp;
}

declare module "institutional/mount" {
  export function mountInstitutional(target: HTMLElement): unknown;
}
