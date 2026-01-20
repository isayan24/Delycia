// Query Key Factory Pattern
// Organized query keys for cache management and invalidation

export const queryKeys = {
  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (filters: { rid?: string }) =>
      [...queryKeys.categories.lists(), filters] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },

  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: { rid?: string; status?: string }) =>
      [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
    realtime: (rid: string) =>
      [...queryKeys.orders.all, 'realtime', rid] as const,
  },

  // Menu / Inventory
  menu: {
    all: ['menu'] as const,
    items: () => [...queryKeys.menu.all, 'items'] as const,
    item: (id: string) => [...queryKeys.menu.items(), id] as const,
    categories: (rid: string) =>
      [...queryKeys.menu.all, 'categories', rid] as const,
  },

  // Tables
  tables: {
    all: ['tables'] as const,
    lists: () => [...queryKeys.tables.all, 'list'] as const,
    list: (rid: string) => [...queryKeys.tables.lists(), rid] as const,
    detail: (id: string) => [...queryKeys.tables.all, 'detail', id] as const,
  },

  // Restaurant
  restaurant: {
    all: ['restaurant'] as const,
    info: (rid: string) => [...queryKeys.restaurant.all, 'info', rid] as const,
    hours: (rid: string) =>
      [...queryKeys.restaurant.all, 'hours', rid] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: (filters: { rid: string; startDate?: string; endDate?: string }) =>
      [...queryKeys.dashboard.all, 'stats', filters] as const,
    salesTrend: (filters: {
      rid: string
      startDate?: string
      endDate?: string
    }) => [...queryKeys.dashboard.all, 'sales-trend', filters] as const,
    orderStatus: (filters: {
      rid: string
      startDate?: string
      endDate?: string
    }) => [...queryKeys.dashboard.all, 'order-status', filters] as const,
    topItems: (filters: {
      rid: string
      startDate?: string
      endDate?: string
    }) => [...queryKeys.dashboard.all, 'top-items', filters] as const,
    categoryRevenue: (filters: {
      rid: string
      startDate?: string
      endDate?: string
    }) => [...queryKeys.dashboard.all, 'category-revenue', filters] as const,

    deliveryTypes: (filters: {
      rid: string
      startDate?: string
      endDate?: string
    }) => [...queryKeys.dashboard.all, 'delivery-types', filters] as const,
    customerOrders: (filters: {
      rid: string
      startDate?: string
      endDate?: string
    }) => [...queryKeys.dashboard.all, 'customer-orders', filters] as const,
    inventory: (filters: {
      rid: string
      startDate?: string
      endDate?: string
      filter?: string
    }) => [...queryKeys.dashboard.all, 'inventory', filters] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (rid: string) => [...queryKeys.users.lists(), rid] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
  },
  // CRM
  crm: {
    all: ['crm'] as const,
    list: (filters: { rid: string }) =>
      [...queryKeys.crm.all, 'list', filters] as const,
    stats: (params: { rid: string }) =>
      [...queryKeys.crm.all, 'stats', params] as const,
    details: (params: { rid: string; customerId: string | null }) =>
      [...queryKeys.crm.all, 'details', params] as const,
  },
}
