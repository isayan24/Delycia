import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteMenuItem } from '@/lib/api/menus'

interface DeleteMenuItemResponse {
  status: boolean
  statusCode: number
  message: string
}

async function deleteMenuItemFn(id: number): Promise<DeleteMenuItemResponse> {
  const response = await deleteMenuItem({ data: { id } })
  const result = await response.json()
  return result
}

export function useDeleteMenuItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMenuItemFn,
    onSuccess: () => {
      // Invalidate all menu queries to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'menus'] 
      })
    },
    onError: (error: any) => {
      console.error('Failed to delete menu item:', error)
    },
  })
}
