import { useMemo } from 'react'
import { useInventoryQuery } from './queries/useInventoryQuery'
import { useRestaurantSelector } from './useRestaurantSelector'

export const useInventoryItems = (categoryId?: string | null) => {
  const { selectedRestaurant } = useRestaurantSelector()
  const rid = selectedRestaurant?.id

  // We fetch ALL items for the restaurant to maintain compatibility with the original behavior
  // which returned 'allItems' (everything) + 'items' (filtered).
  // Server-side filtering by category is supported by the hook, but to support the
  // "allItems" return value, we must fetch everything.
  const {
    data: response,
    isLoading,
    error: queryError,
    refetch,
  } = useInventoryQuery(null, rid, !!rid)

  const entireInventory = useMemo(() => response?.inventory || [], [response])

  const items = useMemo(() => {
    if (!categoryId || !entireInventory.length) {
      return entireInventory
    }
    return entireInventory.filter((item) => item.category_id === categoryId)
  }, [entireInventory, categoryId])

  return {
    items,
    loading: isLoading,
    error: queryError ? 'Failed to load inventory items' : null,
    refetch,
    allItems: entireInventory,
    fetchAllItems: refetch, // Alias for compatibility
  }
}
