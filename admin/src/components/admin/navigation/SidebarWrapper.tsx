import React from "react";
import { AppSidebar } from "./AppSidebar";
import { useRoleBasedUI } from "@/components/user-roles/useRoleBasedUI";

export default function SidebarWrapper() {
  const { canAccessSidebar } = useRoleBasedUI();
  return <div>{canAccessSidebar ? <AppSidebar /> : null}</div>;
}
