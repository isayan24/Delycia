import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

interface SettleCustomerVariables {
  customerId: number
  tableId: number
  restaurantId: string | number
}

interface UseSettleCustomerMutationOptions {
  onSettled?: () => void
}

export function useSettleCustomerMutation(
  options?: UseSettleCustomerMutationOptions,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: SettleCustomerVariables) => {
      const response = await axios.post(
        '/api/orders/actions?action=settle-customer',
        variables,
        { withCredentials: true },
      )
      return response.data
    },
    onSuccess: () => {
      // Invalidate table-orders queries to refresh the popup
      queryClient.invalidateQueries({ queryKey: ['table-orders'] })
      // Invalidate any tables-related queries
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      // Call optional callback
      if (options?.onSettled) {
        options.onSettled()
      }
    },
  })
}
