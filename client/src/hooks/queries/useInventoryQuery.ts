import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useRestaurantId } from '@/hooks/useRestaurantId'
import { queryKeys } from '@/lib/queryKeys'

// Fetcher functions - use local API routes which proxy to backend
export const fetchInventoryItems = async (
  rid: string | null,
  categoryId?: string,
) => {
  const params: Record<string, string> = {}

  if (rid) params.rid = rid
  if (categoryId) params.category_id = categoryId

  // Use local API route which proxies to backend
  const response = await axios.get('/api/inventory', { params })
  if (response.data && response.data.inventory) {
    return response.data.inventory
  }
  return []
}

// Hook for fetching items by category
export const useInventoryQuery = (categoryId?: string) => {
  const rid = useRestaurantId()

  const {
    data: items = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.inventory.byCategory(rid, categoryId),
    queryFn: () => fetchInventoryItems(rid, categoryId),
    enabled: !!categoryId, // Only fetch if categoryId is provided (matching legacy behavior)
  })

  return {
    items,
    loading,
    error: error ? (error as Error).message : null,
    refetch,
  }
}

// Hook for fetching all items
export const useAllInventoryQuery = () => {
  const rid = useRestaurantId()

  const {
    data: allItems = [],
    isLoading: loading,
    error,
    refetch: fetchAllItems,
  } = useQuery({
    queryKey: queryKeys.inventory.allItems(rid),
    queryFn: () => fetchInventoryItems(rid),
    // Always enabled if we are calling this hook, or legacy relied on rid!=null?
    // Legacy: useEffect checks if rid !== null.
    enabled: rid !== null,
  })

  return {
    allItems,
    loading,
    error: error ? (error as Error).message : null,
    fetchAllItems,
  }
}
