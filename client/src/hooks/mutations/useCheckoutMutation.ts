import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import axios from 'axios'

interface CheckoutVariables {
  rid: string | null
  table: string | null
  paymentMethod: string
  special_instruction: string
  orderItems: any[]
  totalPrice: number
  customer_id: string | number
  party_size: number
  table_id?: number // Optional table ID
}

export const useCheckoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: CheckoutVariables) => {
      const response = await axios.post('/api/restaurant/checkout', variables)
      return response.data
    },
    onSuccess: (_data, variables) => {
      // Invalidate orders cache to refetch updated order list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      // Also invalidate the specific customer's orders
      if (variables.customer_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.byCustomer(variables.customer_id),
        })
      }
    },
  })
}
