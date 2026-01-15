import { useUserRole } from "./useUserRole";

/**
 * Hook to get role-specific navigation items
 */
export function useRoleNavigation() {
    const { userRole, isLoading } = useUserRole();
    
    const getNavigationItems = () => {
      if (!userRole) return [];
      
      const navigationItems = {
        // Customer navigation
        0: [
          { name: 'Home', path: '/', icon: '🏠' },
          { name: 'Menu', path: '/menu', icon: '📋' },
          { name: 'Orders', path: '/orders', icon: '📦' },
          { name: 'Cart', path: '/cart', icon: '🛒' },
        ],
  
        // Super Admin navigation
        1: [
          { name: 'System', path: '/super-admin/system', icon: '⚙️' },
          { name: 'Global Analytics', path: '/super-admin/global', icon: '📊' },
          { name: 'Admin Panel', path: '/admin', icon: '👨‍💼' },
          { name: 'Restaurants', path: '/admin/restaurants', icon: '🏪' },
        ],
  
        // Admin navigation
        2: [
          { name: 'Dashboard', path: '/admin', icon: '📊' },
          { name: 'Restaurants', path: '/admin/restaurants', icon: '🏪' },
          { name: 'Users', path: '/admin/users', icon: '👥' },
          { name: 'Approvals', path: '/admin/approve', icon: '✅' },
        ],
  
        // Restaurant Owner navigation
        3: [
          { name: 'Overview', path: '/owner', icon: '📊' },
          { name: 'Restaurants', path: '/owner/restaurants', icon: '🏪' },
          { name: 'Financial', path: '/owner/financial', icon: '💰' },
          { name: 'Analytics', path: '/restaurant/analytics', icon: '📈' },
        ],
  
        // Restaurant Manager navigation
        4: [
          { name: 'Dashboard', path: '/dashboard', icon: '📊' },
          { name: 'Orders', path: '/restaurant/orders', icon: '📦' },
          { name: 'Menu', path: '/restaurant/menu', icon: '📋' },
          { name: 'Staff', path: '/restaurant/staff', icon: '👥' },
          { name: 'Tables', path: '/tables', icon: '🪑' },
        ],
  
        // Waiter navigation (minimal - only essential items)
        5: [
          { name: 'Tables', path: '/tables', icon: '🪑' },
          { name: 'Orders', path: '/waiter/orders', icon: '📦' },
        ],
  
        // Delivery navigation
        6: [
          { name: 'Delivery', path: '/delivery', icon: '🚚' },
          { name: 'Orders', path: '/delivery/orders', icon: '📦' },
          { name: 'Routes', path: '/delivery/routes', icon: '🗺️' },
        ],
      };
  
      return navigationItems[userRole.id as keyof typeof navigationItems] || [];
    };
  
    return {
      navigationItems: getNavigationItems(),
      userRole,
      isLoading
    };
  }