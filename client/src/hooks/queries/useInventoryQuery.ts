import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useRestaurantUsername } from '@/hooks/useRestaurantUsername'
import { queryKeys } from '@/lib/queryKeys'

// Fetcher functions - use local API routes which proxy to backend
export const fetchInventoryItems = async (
  username: string | null,
  categoryId?: string,
) => {
  if (!username) {
    console.warn('[fetchInventoryItems] No username available')
    return []
  }

  const params: Record<string, string> = {}

  params.username = username
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
  const username = useRestaurantUsername()

  const {
    data: items = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.inventory.byCategoryUsername(username, categoryId),
    queryFn: () => fetchInventoryItems(username, categoryId),
    enabled: !!categoryId && !!username, // Only fetch if both categoryId and username exist
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  const username = useRestaurantUsername()

  const {
    data: allItems = [],
    isLoading: loading,
    error,
    refetch: fetchAllItems,
  } = useQuery({
    queryKey: queryKeys.inventory.allItemsUsername(username),
    queryFn: () => fetchInventoryItems(username),
    enabled: !!username, // Only fetch if username exists
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    allItems,
    loading,
    error: error ? (error as Error).message : null,
    fetchAllItems,
  }
}
