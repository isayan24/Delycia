import { usePathname } from "@/hooks/usePathname";
import { ROUTE_ACCESS } from "./roleBasedAccess";
import { useUserRole } from "./useUserRole";

export function useRouteAccess() {
  const { userRole } = useUserRole();
  const pathname = usePathname();

  const canAccessRoute = (route: string, roleId?: number): boolean => {
    const checkRoleId = roleId ?? userRole?.id;
    if (checkRoleId === undefined) return false;

    const allowedRoles = ROUTE_ACCESS[route];
    if (!allowedRoles) {
      // If route not in config, allow management roles by default
      return checkRoleId >= 4 || checkRoleId === 1 || checkRoleId === 2;
    }

    return allowedRoles.includes(checkRoleId);
  };

  const canAccessCurrentRoute = (): boolean => {
    return canAccessRoute(pathname);
  };

  const getAccessibleRoutes = (): string[] => {
    if (!userRole) return [];
    
    return Object.keys(ROUTE_ACCESS).filter(route => 
      canAccessRoute(route, userRole.id)
    );
  };

  return { canAccessRoute, canAccessCurrentRoute, getAccessibleRoutes };
}