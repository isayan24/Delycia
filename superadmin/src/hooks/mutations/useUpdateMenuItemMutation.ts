import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateMenuItem } from '@/lib/api/menus'
import type { MenusResponse } from '@/hooks/queries/useMenusQuery'

interface UpdateMenuItemData {
  id: number
  name?: string
  description?: string
  price?: number
  category_id?: number
  is_available?: boolean
  image_url?: string
}

interface UpdateMenuItemResponse {
  status: boolean
  statusCode: number
  message: string
  data: any
}

async function updateMenuItemFn(data: UpdateMenuItemData): Promise<UpdateMenuItemResponse> {
  const { id, ...updates } = data
  const response = await updateMenuItem({ data: { id, updates } })
  const result = await response.json()
  return result
}

export function useUpdateMenuItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMenuItemFn,
    onMutate: async (updatedMenuItem: UpdateMenuItemData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['superadmin', 'menus'] 
      })

      // Snapshot the previous value
      const previousMenus = queryClient.getQueriesData<MenusResponse>({ 
        queryKey: ['superadmin', 'menus'] 
      })

      // Optimistically update all menu queries
      queryClient.setQueriesData<MenusResponse>(
        { queryKey: ['superadmin', 'menus'] },
        (old: MenusResponse | undefined) => {
          if (!old) return old

          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((menuItem: any) =>
                menuItem.id === updatedMenuItem.id
                  ? { 
                      ...menuItem, 
                      ...updatedMenuItem,
                    }
                  : menuItem
              ),
            },
          }
        }
      )

      return { previousMenus }
    },
    onError: (_error: any, _updatedMenuItem: UpdateMenuItemData, context: any) => {
      // Rollback to the previous value on error
      if (context?.previousMenus) {
        context.previousMenus.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to update menu item:', _error)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'menus'] 
      })
    },
  })
}
