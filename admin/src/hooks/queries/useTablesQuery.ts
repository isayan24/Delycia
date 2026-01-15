import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios' // Call local server routes, NOT backend directly!

// ============================================
// Query Key Factory for Tables
// ============================================
export const tableKeys = {
  all: ['tables'] as const,
  byRestaurant: (rid: string) => [...tableKeys.all, 'restaurant', rid] as const,
  byZone: (zone: string) => [...tableKeys.all, 'zone', zone] as const,
  byId: (id: string) => [...tableKeys.all, 'table', id] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch tables for a restaurant
 */
export function useTablesQuery(rid: string | undefined, enabled = true) {
  return useQuery({
    queryKey: tableKeys.byRestaurant(rid ?? ''),
    queryFn: async () => {
      if (!rid) throw new Error('Restaurant ID is required')
      const response = await axios.get('/api/tables', { params: { rid } })
      return response.data
    },
    enabled: enabled && !!rid,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// ============================================
// Mutation Hooks
// ============================================

interface CreateTableParams {
  rid: string
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
      const { ...data } = params
      const response = await axios.post('/api/table', data)
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: tableKeys.byRestaurant(variables.rid),
      })
    },
  })
}

interface DeleteTableParams {
  id: string
}

/**
 * Delete a table
 */
export function useDeleteTableMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: DeleteTableParams) => {
      const response = await axios.delete('/api/table', {
        data: { id: params.id },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableKeys.all })
    },
  })
}
