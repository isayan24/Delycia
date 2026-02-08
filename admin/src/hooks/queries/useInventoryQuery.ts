import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

// ============================================
// Types
// ============================================

export interface InventoryVariant {
  id: string
  inventory_id: string
  name: string
  price: number
  is_active: boolean
}

export interface InventoryItem {
  id: string
  rid: string
  category_id: string
  name: string
  description?: string
  price: number
  cost?: number
  stock: number
  status: 'available' | 'out_of_stock' | 'hidden'
  images: string[]
  variants?: InventoryVariant[]
  is_veg?: boolean
  created_at?: string
  updated_at?: string
}

interface InventoryResponse {
  inventory: InventoryItem[]
}

// ============================================
// Query Key Factory for Inventory
// ============================================
export const inventoryKeys = {
  all: ['inventory'] as const,
  byRestaurant: (rid: string) =>
    [...inventoryKeys.all, 'restaurant', rid] as const,
  byCategory: (categoryId: string) =>
    [...inventoryKeys.all, 'category', categoryId] as const,
  byId: (id: string) => [...inventoryKeys.all, 'item', id] as const,
  variants: {
    all: ['variants'] as const,
    byInventoryId: (inventoryId: string) =>
      [...inventoryKeys.variants.all, 'inventory', inventoryId] as const,
  },
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch inventory items by category
 */
export function useInventoryQuery(
  categoryId: string | null | undefined,
  rid?: string, // Optional: if we want to fetch all items for a restaurant without category
  enabled = true,
) {
  return useQuery<InventoryResponse>({
    queryKey: categoryId
      ? inventoryKeys.byCategory(categoryId)
      : rid
        ? inventoryKeys.byRestaurant(rid)
        : inventoryKeys.all,
    queryFn: async () => {
      const params: any = {}
      if (categoryId) params.category_id = categoryId
      if (rid && !categoryId) params.rid = rid // Only use rid if category is not present, or backend supports both

      const response = await axios.get('/api/inventory', { params })
      return response.data
    },
    enabled: enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch single inventory item by ID
 */
export function useInventoryItemQuery(id: string | undefined, enabled = true) {
  return useQuery<InventoryItem>({
    queryKey: inventoryKeys.byId(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('Item ID is required')
      const response = await axios.get(`/api/inventory/${id}`)
      return response.data
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch variants for an inventory item
 */
export function useInventoryVariantsQuery(
  inventoryId: string | undefined,
  enabled = true,
) {
  return useQuery<InventoryVariant[]>({
    queryKey: inventoryKeys.variants.byInventoryId(inventoryId ?? ''),
    queryFn: async () => {
      if (!inventoryId) throw new Error('Inventory ID is required')
      const response = await axios.get(
        `/api/variants?inventory_id=${inventoryId}`,
      )
      return response.data?.variants || []
    },
    enabled: enabled && !!inventoryId,
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================
// Mutation Hooks
// ============================================

interface CreateInventoryParams {
  rid: string
  category_id: string
  name: string
  description?: string
  price: number
  cost?: number
  stock?: number
  images?: string[]
  variants?: Array<{ name: string; price: number }>
}

/**
 * Create a new inventory item
 */
export function useCreateInventoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateInventoryParams) => {
      const response = await axios.post('/api/inventory', params)
      return response.data
    },
    onSuccess: (_data, variables) => {
      // Invalidate all inventory queries for this category
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.byCategory(variables.category_id),
      })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
    },
  })
}

interface UpdateInventoryParams {
  id: string
  rid: string
  category_id?: string
  name?: string
  description?: string
  price?: number
  cost?: number
  stock?: number
  status?: string
  images?: string[]
  variants?: Array<{ id?: string; name: string; price: number }>
  selectiveFields?: string[]
  currentStatus?: string
}

/**
 * Update an inventory item
 */
export function useUpdateInventoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UpdateInventoryParams) => {
      const response = await axios.patch('/api/inventory', params)
      return response.data
    },
    onSuccess: (_data, variables) => {
      // Invalidate specific item and category queries
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.byId(variables.id),
      })
      if (variables.category_id) {
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.byCategory(variables.category_id),
        })
      }
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
    },
  })
}

interface DeleteInventoryParams {
  id: string
  rid: string
  img?: string[]
}

/**
 * Delete an inventory item
 */
export function useDeleteInventoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: DeleteInventoryParams) => {
      const response = await axios.delete('/api/inventory', {
        data: params,
      })
      return response.data
    },
    onSuccess: () => {
      // Invalidate all inventory queries
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
    },
  })
}

interface BulkCreateInventoryParams {
  rid: string
  category_id: string
  is_veg: boolean
  items: Array<{
    name: string
    description: string
    price: number
    cost: number
    stock: number
    images: string[]
  }>
}

/**
 * Bulk create inventory items
 */
export function useBulkCreateInventoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: BulkCreateInventoryParams) => {
      const response = await axios.post('/api/inventory/bulk', params)
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.byCategory(variables.category_id),
      })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
    },
  })
}

interface DeleteVariantParams {
  id: number
}

/**
 * Delete a variant
 */
export function useDeleteVariantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: DeleteVariantParams) => {
      const response = await axios.delete('/api/variants', {
        data: params,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.variants.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
    },
  })
}
