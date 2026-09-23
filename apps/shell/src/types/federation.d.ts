declare module "institucional/App" {
  import { ComponentType } from "react";

  const InstitutionalApp: ComponentType;
  export default InstitutionalApp;
}

declare module "admin/App" {
  import { ComponentType } from "react";
  import type { UserRole } from "@niar/contracts";

  const AdminApp: ComponentType<{
    mode?: "admin" | "public";
    currentUser?: { name: string; email: string; role: UserRole };
  }>;
  export default AdminApp;
}

declare module "assistant/App" {
  import { ComponentType } from "react";

  const AssistantApp: ComponentType;
  export default AssistantApp;
}
