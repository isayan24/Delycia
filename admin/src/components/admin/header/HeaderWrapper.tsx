import React from "react";
import AdminHeader from "./AdminHeader";
import { useRoleBasedUI } from "@/components/user-roles/useRoleBasedUI";
import WaiterHeader from "./WaiterHeader";

export default function HeaderWrapper() {
  const { getHeaderType } = useRoleBasedUI();

  if (getHeaderType === "none") return null;

 if (getHeaderType === "full")  return <AdminHeader />;

 if (getHeaderType === "minimal") return <WaiterHeader />;
    
 }
