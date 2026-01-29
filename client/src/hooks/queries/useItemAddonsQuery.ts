import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { queryKeys } from '@/lib/queryKeys'

export interface Addon {
  id: number
  name: string
  price: number
  is_veg: number
  max_quantity?: number
  is_default?: number
  is_active?: number
  description?: string
  quantity?: number
}

interface AddonsResponse {
  addons: Addon[]
}

export const useItemAddonsQuery = (itemId: string | number | undefined) => {
  return useQuery({
    queryKey: queryKeys.addons.byItem(itemId),
    queryFn: async (): Promise<AddonsResponse> => {
      // Ensure we don't make requests with undefined/null ID
      if (!itemId) return { addons: [] }

      const response = await axiosInstance.get(
        `/users/addons?inventory_id=${itemId}`,
      )
      return response.data
    },
    enabled: !!itemId, // Only run query if itemId exists
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}
