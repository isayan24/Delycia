import { useMutation } from '@tanstack/react-query'
import { useTableStore } from '@/store/useTableStore'
import useToast from '@/hooks/UseToast'
import axios from 'axios'

interface UpdateTableStatusParams {
  id: number
  status: 'available' | 'occupied' | 'reserved' | 'pending'
  capacity?: number
  zone?: string
}

const { showSuccess, showError } = useToast()

export function useUpdateTableStatus() {
  const { refetchTablesFunction } = useTableStore()

  return useMutation({
    mutationFn: async (data: UpdateTableStatusParams) => {
      const response = await axios.patch('/api/table', {
        id: data.id,
        status: data.status,
        capacity: data.capacity,
        zone: data.zone,
      })
      return response.data
    },
    onSuccess: async () => {
      showSuccess('Success', 'Table status updated successfully')
      if (refetchTablesFunction) {
        await refetchTablesFunction()
      }
    },
    onError: (error: any) => {
      showError(
        'Error',
        error.response?.data?.message || 'Failed to update table status',
      )
    },
  })
}
