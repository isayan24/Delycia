import { useEffect, useState } from "react";
import roleManager, { RoleData } from "./roleManager";
import sessionService from "@/services/sessionService";

/**
 * Hook to get current user role and permissions
 */
export function useUserRole() {
  const [userRole, setUserRole] = useState<RoleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Get user data from session service
      const userData = sessionService.getUserData();
      
      if (userData && userData.role !== undefined) {
        const role = roleManager.getRoleById(userData.role);
        setUserRole(role);
        setError(null);
      } else {
        setUserRole(null);
        setError('No user session found');
      }
    } catch (err) {
      console.error('Failed to get user role:', err);
      setUserRole(null);
      setError('Failed to load user role');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { userRole, isLoading, error };
}