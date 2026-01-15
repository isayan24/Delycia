
export interface RoleData {
  id: number;
  name: string;
  description: string;
  power: number;
}

export interface RolePermissions {
  canManageOrders: boolean;
  canManageStaff: boolean;
  canManageRestaurant: boolean;
  canApproveRestaurants: boolean;
  canViewDeliveries: boolean;
  canFullSystemControl: boolean;
  canManageOperations: boolean;
}

// Role definitions based on your data
const ROLES: Record<number, RoleData> = {
  0: {
    id: 0,
    name: "Customer",
    description: "Simple ordering",
    power: 0,
  },
  1: {
    id: 1,
    name: "Super Admin",
    description: "Full system control",
    power: 100,
  },
  2: {
    id: 2,
    name: "Admin",
    description: "High-level management, approve restaurants, manage...",
    power: 90,
  },
  3: {
    id: 3,
    name: "Restaurant Owner",
    description: "Control over own restaurant",
    power: 80,
  },
  4: {
    id: 4,
    name: "Restaurant Manager",
    description: "Manage restaurant operations, orders, staff schedu...",
    power: 70,
  },
  5: {
    id: 5,
    name: "Waiter",
    description: "View, create, update orders",
    power: 60,
  },
  6: {
    id: 6,
    name: "Delivery",
    description: "View assigned orders, update delivery status",
    power: 50,
  },
};

class RoleManager {
  private static instance: RoleManager;

  private constructor() {}

  static getInstance(): RoleManager {
    if (!RoleManager.instance) {
      RoleManager.instance = new RoleManager();
    }
    return RoleManager.instance;
  }

  /**
   * Get role data by role ID
   */
  getRoleById(roleId: number): RoleData | null {
    return ROLES[roleId] || null;
  }

  /**
   * Get role name by role ID
   */
  getRoleName(roleId: number): string {
    const role = this.getRoleById(roleId);
    return role?.name || "Unknown Role";
  }

  /**
   * Get role description by role ID
   */
  getRoleDescription(roleId: number): string {
    const role = this.getRoleById(roleId);
    return role?.description || "No description available";
  }

  /**
   * Get role power level by role ID
   */
  getRolePower(roleId: number): number {
    const role = this.getRoleById(roleId);
    return role?.power || 0;
  }

  /**
   * Get all available roles
   */
  getAllRoles(): RoleData[] {
    return Object.values(ROLES);
  }

  /**
   * Check if a role exists
   */
  isValidRole(roleId: number): boolean {
    return roleId in ROLES;
  } 

  /**
   * Compare two roles by power level
   */
  compareRoles(roleId1: number, roleId2: number): number {
    const power1 = this.getRolePower(roleId1);
    const power2 = this.getRolePower(roleId2);
    return power1 - power2;
  }

  /**
   * Check if role1 has higher or equal power than role2
   */
  hasHigherOrEqualPower(roleId1: number, roleId2: number): boolean {
    return this.compareRoles(roleId1, roleId2) >= 0;
  }

  /**
   * Get roles that are accessible by a specific role (lower or equal power)
   */
  getAccessibleRoles(roleId: number): RoleData[] {
    const currentPower = this.getRolePower(roleId);
    return this.getAllRoles().filter((role) => role.power <= currentPower);
  }

  /**
   * Get roles with higher power than current role
   */
  getHigherRoles(roleId: number): RoleData[] {
    const currentPower = this.getRolePower(roleId);
    return this.getAllRoles().filter((role) => role.power > currentPower);
  }

  /**
   * Check if role can manage another role
   */
  canManageRole(managerRoleId: number, targetRoleId: number): boolean {
    // Can manage roles with lower power
    return this.compareRoles(managerRoleId, targetRoleId) > 0;
  }

  /**
   * Get role display badge color based on power level
   */
  getRoleBadgeColor(roleId: number): string {
    const power = this.getRolePower(roleId);

    if (power >= 100) return "bg-red-500"; // Super Admin
    if (power >= 80) return "bg-orange-500"; // Admin/Owner
    if (power >= 60) return "bg-blue-500"; // Manager/Waiter
    if (power >= 50) return "bg-green-500"; // Delivery
    return "bg-gray-500"; // Customer/Unknown
  }

  /**
   * Get shortened role name for display
   */
  getShortRoleName(roleId: number): string {
    const role = this.getRoleById(roleId);
    if (!role) return "Unknown";

    const shortNames: Record<string, string> = {
      "Super Admin": "S.Admin",
      "Restaurant Owner": "Owner",
      "Restaurant Manager": "Manager",
      Delivery: "Delivery",
    };

    return shortNames[role.name] || role.name;
  }

  /**
   * Get role from session service (client-side)
   */
  async getCurrentUserRole(): Promise<RoleData | null> {
    try {
      // Only import on client-side
      if (typeof window !== "undefined") {
        const sessionService = (await import("@/services/sessionService"))
          .default;
        const userData = sessionService.getUserData();
        return userData ? this.getRoleById(userData.role) : null;
      }
      return null;
    } catch (error) {
      console.error("Failed to get current user role:", error);
      return null;
    }
  }

 
 
}

// Create singleton instance
const roleManager = RoleManager.getInstance();

// Export both the class and the instance for flexibility
export { RoleManager };
export default roleManager;

// Utility functions for easy access
export const getRoleName = (roleId: number): string =>
  roleManager.getRoleName(roleId);
export const getRoleDescription = (roleId: number): string =>
  roleManager.getRoleDescription(roleId);
export const getRolePower = (roleId: number): number =>
  roleManager.getRolePower(roleId);  
export const getRoleBadgeColor = (roleId: number): string =>
  roleManager.getRoleBadgeColor(roleId);
export const getShortRoleName = (roleId: number): string =>
  roleManager.getShortRoleName(roleId);

// Server-side compatible functions (no session dependency)
export const getRoleById = (roleId: number): RoleData | null =>
  roleManager.getRoleById(roleId);
export const getAllRoles = (): RoleData[] => roleManager.getAllRoles();
export const isValidRole = (roleId: number): boolean =>
  roleManager.isValidRole(roleId);
export const compareRoles = (roleId1: number, roleId2: number): number =>
  roleManager.compareRoles(roleId1, roleId2);
export const canManageRole = (
  managerRoleId: number,
  targetRoleId: number
): boolean => roleManager.canManageRole(managerRoleId, targetRoleId);
  
