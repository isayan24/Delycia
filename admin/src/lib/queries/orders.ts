import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateOrders } from '../api/orders'
import { queryKeys } from './queryKeys'

// Order Mutations
export const useOrderMutations = () => {
  const queryClient = useQueryClient()

  // Update orders mutation with optimistic updates
  const updateMutation = useMutation({
    mutationFn: (data: {
      token: string
      order_item_ids: string[]
      order_status: string
      preparation_time?: number
    }) => updateOrders({ data }),
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.all })

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData(queryKeys.orders.all)

      // Optimistically update order status
      queryClient.setQueryData(queryKeys.orders.all, (old: any) => {
        if (!old) return old
        // Update orders in cache optimistically
        return {
          ...old,
          orders: old.orders?.map((order: any) =>
            variables.order_item_ids.includes(order.id)
              ? { ...order, order_status: variables.order_status }
              : order,
          ),
        }
      })

      return { previousOrders }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(queryKeys.orders.all, context.previousOrders)
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
  })

  return {
    update: updateMutation,
  }
}
