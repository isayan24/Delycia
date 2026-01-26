import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import useToast from '../UseToast'

export const useMergeOrders = () => {
  const queryClient = useQueryClient()
  const { showError, showSuccess } = useToast()
  return useMutation({
    mutationFn: async ({
      cartIds,
      targetCartId,
    }: {
      cartIds: string[]
      targetCartId: string
    }) => {
      const response = await axios.post('/api/orders', {
        action: 'merge',
        cart_ids: cartIds,
        target_cart_id: targetCartId,
      })
      return response.data
    },
    onSuccess: (data) => {
      if (data.status) {
        showSuccess('Success', 'Orders merged successfully')
        // Invalidate orders queries to refresh the list
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        queryClient.invalidateQueries({ queryKey: ['orderHistory'] })
      } else {
        showError('Error', data.message || 'Failed to merge orders')
      }
    },
    onError: (error: any) => {
      console.error('Merge mutation error:', error)
      showError(
        'Error',
        error.response?.data?.message || 'An error occurred while merging',
      )
    },
  })
}
