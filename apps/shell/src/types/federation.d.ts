declare module "admin/App" {
  import { ComponentType } from "react";
  import type { UserAccountStatus, UserRole } from "@niar/contracts";

  const AdminApp: ComponentType<{
    mode?: "admin" | "public";
    currentUser?: { id: number; name: string; email: string; role: UserRole; accountStatus: UserAccountStatus };
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
