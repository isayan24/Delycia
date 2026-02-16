import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bulkUpdateMenuItems } from '@/lib/api/menus'
import type { BulkUpdateMenuData } from '@/schemas/menuSchema'

interface BulkUpdateMenuResponse {
  status: boolean
  statusCode: number
  message: string
  data: {
    updated_count: number
  }
}

async function bulkUpdateMenuFn(data: BulkUpdateMenuData): Promise<BulkUpdateMenuResponse> {
  const response = await bulkUpdateMenuItems({ data: { items: data.item_ids.map(id => ({ id, ...data.updates })) } })
  const result = await response.json()
  return result
}

export function useBulkUpdateMenuMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkUpdateMenuFn,
    onSuccess: (response) => {
      // Invalidate all menu queries to refetch with updated data
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'menus'] 
      })
    },
    onError: (error: any) => {
      console.error('Failed to bulk update menu items:', error)
    },
  })
}
