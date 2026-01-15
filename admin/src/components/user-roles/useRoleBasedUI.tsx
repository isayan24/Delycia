import { UI_ACCESS } from "./roleBasedAccess";
import { useUserRole } from "./useUserRole";

export function useRoleBasedUI() {
  const { userRole, isLoading } = useUserRole();

  const shouldShowComponent = (allowedRoles: number[]): boolean => {
    if (!userRole) return false;
    return allowedRoles.includes(userRole.id);
  };

  const roleId = userRole?.id || null;
     
  const canAccessSidebar = () => {
    if (!userRole) return false;
    return UI_ACCESS.sidebar.management.includes(roleId); 
  };

  const getHeaderType = (): "full" | "minimal" | "none" => {
    if (!userRole) return "none";
  
    if (UI_ACCESS.header.minimal.includes(userRole.id)) return "minimal";
    if (UI_ACCESS.header.full.includes(userRole.id)) return "full";
    return "none";
  };

  const getOrderPopup = (): "none" | "admin" => {
    if (!userRole) return "none";
    if (UI_ACCESS.orderPopup.admin.includes(userRole.id)) return "admin";
    if (UI_ACCESS.orderPopup.waiter.includes(userRole.id)) return "none";
    return "none";
  };

  return {
    shouldShowComponent,
    // uiConfig: getUIConfig(),
    userRole,
    isLoading,
    canAccessSidebar: canAccessSidebar(),
    getHeaderType: getHeaderType(),
    getOrderPopup: getOrderPopup()
  };
}