import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { useRestaurantId } from '@/hooks/useRestaurantId'

// Fetcher functions
export const fetchInventoryItems = async (
  rid: string | null,
  categoryId?: string,
) => {
  let url = '/inventory'
  const params: Record<string, string> = {}

  if (rid) params.rid = rid
  if (categoryId) params.category_id = categoryId

  // Construct URL with params manually or use axios params
  // Legacy used template strings, so let's stick to axios params for cleaner code
  // BUT legacy logic:
  // url = rid ? `/inventory?rid=${rid}` : "/inventory";
  // url = rid ? `/inventory?category_id=${categoryId}&rid=${rid}` : ...

  const response = await axiosInstance.get(url, { params })
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
    queryKey: ['inventory', { rid, categoryId }],
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
    queryKey: ['inventory', { rid, type: 'all' }],
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
