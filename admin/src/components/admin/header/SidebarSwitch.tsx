import { useSidebar } from "@/components/ui/sidebar";
import { useRoleBasedUI } from "@/components/user-roles/useRoleBasedUI";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlignLeft } from "lucide-react";
import React from "react";

export default function SidebarSwitch() {
  const { toggleSidebar } = useSidebar();
  const { getHeaderType } = useRoleBasedUI();
    const isMobile = useIsMobile();
  if (getHeaderType === "full")
    return (
      <div className={`${!isMobile && "hidden"} fixed top-7 left-[.5rem] z-50`}>
        <button className="w-[6rem] shrink-0" onClick={toggleSidebar}>
          <AlignLeft className="h-5 w-5 text-black"/>
        </button>
      </div>
    );
}
