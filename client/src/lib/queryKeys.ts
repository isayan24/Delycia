/**
 * Query Key Factory
 *
 * Centralized query key definitions for TanStack Query.
 * This ensures consistent query keys across the application and makes
 * cache invalidation easier and more predictable.
 *
 * Usage:
 *   import { queryKeys } from '@/lib/queryKeys'
 *
 *   // In a query hook:
 *   useQuery({
 *     queryKey: queryKeys.inventory.byCategory(rid, categoryId),
 *     queryFn: () => fetchInventoryItems(rid, categoryId),
 *   })
 *
 *   // For cache invalidation:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
 */

export const queryKeys = {
  // Inventory queries
  inventory: {
    all: ['inventory'] as const,
    byRid: (rid: string | null) => ['inventory', { rid }] as const,
    byCategory: (rid: string | null, categoryId?: string) =>
      ['inventory', { rid, categoryId }] as const,
    allItems: (rid: string | null) =>
      ['inventory', { rid, type: 'all' }] as const,
    // Username-based keys
    byCategoryUsername: (username: string | null, categoryId?: string) =>
      ['inventory', { username, categoryId }] as const,
    allItemsUsername: (username: string | null) =>
      ['inventory', { username, type: 'all' }] as const,
  },

  // Orders queries
  orders: {
    all: ['orders'] as const,
    byCustomer: (customerId: string | number | null | undefined) =>
      ['orders', { customerId }] as const,
  },

  // Categories queries
  categories: {
    all: ['categories'] as const,
    byRid: (rid: string | null) => ['categories', { rid }] as const,
    byUsername: (username: string | null) => ['categories', { username }] as const,
  },

  // Restaurant queries
  restaurants: {
    all: ['restaurants'] as const,
    detail: (rid: string | number | null | undefined) =>
      ['restaurant', { rid }] as const,
    byUsername: (username: string | undefined) =>
      ['restaurant', { username }] as const,
  },

  // Auth queries
  auth: {
    all: ['auth'] as const,
    user: () => ['auth', 'user'] as const,
    session: () => ['auth', 'session'] as const,
  },

  // Addons queries
  addons: {
    byItem: (itemId: string | number | undefined) =>
      ['addons', { itemId }] as const,
  },
} as const

// Type helpers for query key inference
export type QueryKeys = typeof queryKeys
