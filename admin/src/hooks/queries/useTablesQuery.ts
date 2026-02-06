import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import axios from 'axios'

// ============================================
// Types
// ============================================

export interface Table {
  id: number
  table_number: string
  zone: string
  status: 'available' | 'occupied' | 'reserved' | 'pending'
  capacity: number
  party_size?: number
  created_at?: string
  updated_at?: string
}

export interface Zone {
  zone: string
}

interface TablesResponse {
  statusCode: number
  message: string
  tables: Table[]
}

interface ZonesResponse {
  statusCode: number
  message: string
  zones: Zone[]
}

// ============================================
// Query Key Factory for Tables
// ============================================

export const tableKeys = {
  all: ['tables'] as const,
  lists: () => [...tableKeys.all, 'list'] as const,
  list: (rid: string) => [...tableKeys.lists(), rid] as const,
  zones: () => [...tableKeys.all, 'zones'] as const,
  zoneList: (rid: string) => [...tableKeys.zones(), rid] as const,
  detail: (id: string) => [...tableKeys.all, 'detail', id] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch all tables for a restaurant
 */
export function useTablesQuery(
  rid: string | number | undefined | null,
  enabled = true,
) {
  const ridString = rid?.toString() ?? ''

  return useQuery<TablesResponse>({
    queryKey: tableKeys.list(ridString),
    queryFn: async () => {
      if (!ridString) throw new Error('Restaurant ID is required')
      const response = await axios.get('/api/tables', {
        params: { rid: ridString, type: 'tables' },
      })
      return response.data
    },
    enabled: enabled && !!ridString,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch all zones for a restaurant
 */
export function useZonesQuery(
  rid: string | number | undefined | null,
  enabled = true,
) {
  const ridString = rid?.toString() ?? ''

  return useQuery<ZonesResponse>({
    queryKey: tableKeys.zoneList(ridString),
    queryFn: async () => {
      if (!ridString) throw new Error('Restaurant ID is required')
      const response = await axios.get('/api/tables', {
        params: { rid: ridString, type: 'zones' },
      })
      return response.data
    },
    enabled: enabled && !!ridString,
    staleTime: 5 * 60 * 1000, // 5 minutes (zones change less frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// ============================================
// Mutation Hooks
// ============================================

interface CreateTableParams {
  rid: string | number
  table_number: string
  capacity: number
  zone: string
}

/**
 * Create a new table
 */
export function useCreateTableMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateTableParams) => {
      const response = await axios.post('/api/tables', {
        rid: params.rid.toString(),
        table_number: params.table_number,
        capacity: params.capacity,
        zone: params.zone,
      })
      return response.data
    },
    onSuccess: (_data, variables) => {
      // Invalidate tables list for this restaurant
      queryClient.invalidateQueries({
        queryKey: tableKeys.list(variables.rid.toString()),
      })
      // Also invalidate zones in case a new zone was created
      queryClient.invalidateQueries({
        queryKey: tableKeys.zoneList(variables.rid.toString()),
      })
    },
  })
}

interface UpdateTableParams {
  id: string | number
  rid: string | number // For cache invalidation
  status?: string
  capacity?: number
  zone?: string
}

/**
 * Update a table
 */
export function useUpdateTableMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdateTableParams) => {
      const { rid, ...updateData } = params
      const response = await axios.patch('/api/tables', {
        id: updateData.id.toString(),
        status: updateData.status,
        capacity: updateData.capacity,
        zone: updateData.zone,
      })
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: tableKeys.list(variables.rid.toString()),
      })
    },
  })
}

interface DeleteTableParams {
  id: string | number
  rid: string | number // For cache invalidation
}

/**
 * Delete a table
 */
export function useDeleteTableMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: DeleteTableParams) => {
      const response = await axios.delete('/api/tables', {
        data: { id: params.id.toString() },
      })
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: tableKeys.list(variables.rid.toString()),
      })
      // Also invalidate zones list in case the last table in a zone was deleted
      queryClient.invalidateQueries({
        queryKey: tableKeys.zoneList(variables.rid.toString()),
      })
    },
  })
}

// ============================================
// Helper Hooks
// ============================================

/**
 * Combined hook to fetch both tables and zones
 * Useful for components that need both data sets
 */
export function useTablesAndZones(
  rid: string | number | undefined | null,
  enabled = true,
) {
  const tablesQuery = useTablesQuery(rid, enabled)
  const zonesQuery = useZonesQuery(rid, enabled)

  // Memoize refetch to prevent infinite re-renders
  const refetch = useCallback(() => {
    tablesQuery.refetch()
    zonesQuery.refetch()
  }, [tablesQuery.refetch, zonesQuery.refetch])

  return {
    tables: tablesQuery.data?.tables ?? [],
    zones: zonesQuery.data?.zones ?? [],
    isLoading: tablesQuery.isLoading || zonesQuery.isLoading,
    isError: tablesQuery.isError || zonesQuery.isError,
    error: tablesQuery.error || zonesQuery.error,
    refetch,
  }
}
