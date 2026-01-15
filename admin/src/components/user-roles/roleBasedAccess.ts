// Route access configuration
export const ROUTE_ACCESS: Record<string, number[]> = {
  // all can acc
  '/login': [1, 2, 3, 4, 5, 6],
  '/p': [1, 2, 3, 4, 5, 6],
  // Waiter specific routes
  '/book-table': [5, 4, 3, 2, 1], // Waiter and above can access tables
  '/waiter': [5, 4, 3, 2, 1], // Waiter dashboard
  '/waiter/orders': [5, 4, 3, 2, 1], // Waiter order management

  // Delivery routes
  '/delivery': [6, 4, 3, 2, 1], // Delivery and management roles
  '/delivery/orders': [6, 4, 3, 2, 1],

  // Restaurant management routes
  '/dashboard': [4, 3, 2, 1], // Manager and above
  '/restaurant': [4, 3, 2, 1],
  '/menu': [4, 3, 2, 1],
  '/staff': [4, 3, 2, 1],
  '/orders': [4, 3, 2, 1],
  '/analytics': [3, 2, 1], // Owner and above

  // Owner routes
  '/owner': [3, 2, 1],
  '/owner/restaurants': [3, 2, 1],
  '/owner/financial': [3, 2, 1],

  // Admin routes
  '/admin': [2, 1],
  '/admin/restaurants': [2, 1],
  '/admin/users': [2, 1],
  '/admin/approve': [2, 1],

  // Super Admin routes
  '/super-admin': [1],
  '/super-admin/system': [1],
  '/super-admin/global': [1],
};

// UI Component access configuration
export const UI_ACCESS: any = { 
  sidebar: {
    waiter: [], // Waiters don't see sidebar
    delivery: [6], // Delivery sees minimal sidebar
    management: [4, 3, 2, 1], // Management roles see full sidebar
  },
  header: {
    full: [0, 6, 4, 3, 2, 1], // Most roles see full header
    minimal: [5], // Waiters see minimal header
    none: [], // No roles completely hide header
  },
  navigation: {
    customer: [0],
    waiter: [5],
    delivery: [6],
    management: [4, 3, 2, 1],
  },
  orderPopup: {
    waiter: [],
    admin: [4, 3, 2, 1],
  }
};

// Default redirects for each role
export const DEFAULT_ROUTES: Record<number, string> = {
  0: '/', // Customer -> Home
  1: '/dashboard', // Super Admin -> Super Admin Dashboard
  2: '/orders', // Admin -> Admin Dashboard
  3: '/orders', // Restaurant Owner -> Owner Dashboard
  4: '/orders', // Restaurant Manager -> Management Dashboard
  5: '/book-table', // Waiter -> Tables (their main work area)
  6: '/delivery', // Delivery -> Delivery Dashboard
};