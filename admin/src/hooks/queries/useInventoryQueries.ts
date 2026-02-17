import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query'
import axios from 'axios'
import { queryKeys } from '@/lib/queries/queryKeys'

export interface InventoryStatsData {
  id: number
  name: string
  description: string
  price: number
  stock: number
  status: string
  category: string
  images: string[]
  performance: {
    totalOrders: number
    unitsSold: number
    revenue: number
    popularityScore: number
    lastOrdered: string | null
    daysSinceLastOrder: number
  }
  recentOrders: {
    id: number
    status: string
    quantity: number
    amount: number
    discount: number
    date: string
    customer: {
      id: number
      name: string
      phone: string
    }
  }[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const useInventoryItemStats = (
  itemId: string | undefined,
  rid: string | undefined,
  page: number = 1,
  limit: number = 10,
) => {
  return useQuery({
    queryKey: ['inventory', 'stats', itemId, rid, page, limit],
    queryFn: async () => {
      const { data } = await axios.get('/api/inventory-stats', {
        params: { itemId, rid, page, limit },
      })

      // Check for nested data property usually returned by apiResponse.success
      if (data && data.data) {
        return data.data as InventoryStatsData
      }
      // Fallback if data is returned directly or structure is different
      return data as InventoryStatsData
    },
    enabled: !!itemId && !!rid,
    placeholderData: keepPreviousData,
  })
}

export const useInfiniteInventoryItemOrdersQuery = (
  itemId: string | undefined,
  rid: string | undefined,
  limit: number = 10,
) => {
  return useInfiniteQuery({
    queryKey: ['inventory', 'stats-infinite', itemId, rid, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axios.get('/api/inventory-stats', {
        params: { itemId, rid, page: pageParam, limit },
      })

      // Check for nested data property
      const statsData = (
        data && data.data ? data.data : data
      ) as InventoryStatsData
      return statsData
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (
        lastPage.pagination &&
        lastPage.pagination.page < lastPage.pagination.totalPages
      ) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
    enabled: !!itemId && !!rid,
    staleTime: 30000,
  })
}

export const useUpdateStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      rid,
      stock,
    }: {
      id: number
      rid: number
      stock: number
    }) => {
      // Determine status based on stock
      let status = 'available'
      if (stock === 0) status = 'out_of_stock'
      else if (stock < 10) status = 'low'

      const payload = {
        id,
        rid,
        stock,
        status,
        selectiveFields: ['stock', 'status'],
      }
      const { data } = await axios.patch('/api/inventory', payload)
      return data
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['inventory', 'stats', String(variables.id)],
      })
      // Invalidate dashboard inventory list
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.all,
      })
    },
  })
}
