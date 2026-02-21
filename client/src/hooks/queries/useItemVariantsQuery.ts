import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { queryKeys } from '@/lib/queryKeys'

export interface Variant {
  id: number
  name: string
  price: number
  inventory_id?: number
  is_active?: number
}

interface VariantsResponse {
  variants: Variant[]
}

export const useItemVariantsQuery = (itemId: string | number | undefined) => {
  return useQuery({
    queryKey: queryKeys.variants.byItem(itemId),
    queryFn: async (): Promise<VariantsResponse> => {
      if (!itemId) return { variants: [] }

      const response = await axiosInstance.get(
        `/variants?inventory_id=${itemId}`,
      )
      return response.data
    },
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes — variants rarely change
  })
}
