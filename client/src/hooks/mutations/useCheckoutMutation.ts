import { useMutation } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios' // Using client axios instance

interface CheckoutVariables {
  rid: string | null
  table: string | null
  paymentMethod: string
  special_instruction: string
  orderItems: any[]
  totalPrice: number
  customer_id: string
  accessToken: string
}

export const useCheckoutMutation = () => {
  return useMutation({
    mutationFn: async (variables: CheckoutVariables) => {
      const response = await axiosInstance.post(
        '/restaurant/checkout',
        variables,
      )
      return response.data
    },
  })
}
