/**
 * Restaurant Feature Flags Query Hooks
 *
 * Production-grade TanStack Query hooks for per-restaurant feature toggles.
 * Features control sidebar visibility, route access, and UI behavior.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queries/queryKeys'
import axios, { AxiosError } from 'axios'

// ============================================
// Type Definitions
// ============================================

export interface FeatureFlags {
  rid: number
  table_management: number
  staff_management: number
  inventory_management: number
  reports: number
  crm: number
  updated_at: string
}

/** Keys that are actual feature toggles (excludes rid, updated_at) */
export type FeatureKey = Exclude<keyof FeatureFlags, 'rid' | 'updated_at'>

export interface FeatureFlagMeta {
  key: FeatureKey
  label: string
  description: string
  /** Routes that are disabled when this feature is off */
  disabledRoutes: string[]
  /** Sidebar nav items titles that are hidden when this feature is off */
  hiddenNavItems: string[]
}

/**
 * Master registry of all feature flags with their metadata.
 * Single source of truth for labels, descriptions, route guards, and sidebar filtering.
 */
export const FEATURE_FLAGS_META: FeatureFlagMeta[] = [
  {
    key: 'table_management',
    label: 'Table Management',
    description:
      'Manage restaurant tables, zones, and seating. Includes book-table feature.',
    disabledRoutes: ['/billing/book-table'],
    hiddenNavItems: ['Book Table'],
  },
  {
    key: 'staff_management',
    label: 'Staff Management',
    description:
      'Manage staff members, assign roles, and track performance reports.',
    disabledRoutes: ['/staff', '/reports/staff'],
    hiddenNavItems: ['Staff Management', 'Staff Reports'],
  },
  {
    key: 'inventory_management',
    label: 'Inventory Management',
    description:
      'Track stock levels, low-stock alerts, and manage inventory quantities.',
    disabledRoutes: ['/inventory/stock'],
    hiddenNavItems: ['Manage Inventory'],
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    description:
      'Access sales reports, inventory analytics, and customer insights.',
    disabledRoutes: [
      '/reports',
      '/reports/sales',
      '/reports/inventory',
      '/reports/crm',
      '/reports/staff',
    ],
    hiddenNavItems: [
      'Reports',
      'Sales Report',
      'Inventory Report',
      'Customer Management',
    ],
  },
  {
    key: 'crm',
    label: 'Customer Management (CRM)',
    description:
      'Track customer visits, order history, and manage relationships.',
    disabledRoutes: ['/reports/crm'],
    hiddenNavItems: ['Customer Management'],
  },
]

// ============================================
// Query Hook
// ============================================

interface FeatureFlagsResponse {
  statusCode: number
  message: string
  features: FeatureFlags
  error?: boolean
}

/**
 * Fetch feature flags for a restaurant.
 * Returns all toggles with aggressive caching since flags rarely change.
 */
export function useFeatureFlagsQuery(rid?: string) {
  return useQuery({
    queryKey: queryKeys.features.byRid(rid || 'default'),
    queryFn: async (): Promise<FeatureFlags> => {
      const response = await axios.get<FeatureFlagsResponse>(
        `/api/feature-flags${rid ? `?rid=${rid}` : ''}`,
        { withCredentials: true },
      )
      return response.data.features
    },
    enabled: !!rid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      if ((error as AxiosError)?.response?.status === 429) return false
      if (
        (error as AxiosError)?.response?.status === 401 ||
        (error as AxiosError)?.response?.status === 403
      )
        return false
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

// ============================================
// Mutation Hook
// ============================================

interface UpdateFeatureFlagsParams {
  rid: number
  [key: string]: number
}

/**
 * Update feature flags with optimistic UI.
 * Toggles are reflected instantly; rolls back on error.
 */
export function useUpdateFeatureFlagsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      params: UpdateFeatureFlagsParams,
    ): Promise<{ statusCode: number; message: string }> => {
      const response = await axios.patch<{
        statusCode: number
        message: string
      }>('/api/feature-flags', params, { withCredentials: true })
      return response.data
    },
    onMutate: async (variables) => {
      const ridKey = variables.rid.toString()
      const queryKey = queryKeys.features.byRid(ridKey)

      // Cancel any outgoing queries
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousFlags = queryClient.getQueryData<FeatureFlags>(queryKey)

      // Optimistic update
      if (previousFlags) {
        const { rid: _rid, ...updates } = variables
        queryClient.setQueryData<FeatureFlags>(queryKey, {
          ...previousFlags,
          ...updates,
        })
      }

      return { previousFlags }
    },
    onError: (_error, variables, context) => {
      // Rollback on error
      if (context?.previousFlags) {
        queryClient.setQueryData(
          queryKeys.features.byRid(variables.rid.toString()),
          context.previousFlags,
        )
      }
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch to ensure server state
      queryClient.invalidateQueries({
        queryKey: queryKeys.features.byRid(variables.rid.toString()),
      })
    },
  })
}

// ============================================
// Utility Helpers
// ============================================

/**
 * Check if a specific feature is enabled in the flags object.
 * Returns true if flags are not yet loaded (graceful degradation).
 */
export function isFeatureEnabled(
  flags: FeatureFlags | undefined,
  key: FeatureKey,
): boolean {
  if (!flags) return true // Default to enabled while loading
  return flags[key] === 1
}

/**
 * Get all disabled route prefixes based on current feature flags.
 */
export function getDisabledRoutes(flags: FeatureFlags | undefined): string[] {
  if (!flags) return []
  const disabled: string[] = []
  for (const meta of FEATURE_FLAGS_META) {
    if (flags[meta.key] === 0) {
      disabled.push(...meta.disabledRoutes)
    }
  }
  return disabled
}

/**
 * Get all hidden nav item titles based on current feature flags.
 */
export function getHiddenNavItems(
  flags: FeatureFlags | undefined,
): Set<string> {
  const hidden = new Set<string>()
  if (!flags) return hidden
  for (const meta of FEATURE_FLAGS_META) {
    if (flags[meta.key] === 0) {
      for (const item of meta.hiddenNavItems) {
        hidden.add(item)
      }
    }
  }
  return hidden
}
