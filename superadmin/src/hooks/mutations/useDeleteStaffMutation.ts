import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteStaff } from '@/lib/api/staff'

interface DeleteStaffResponse {
  status: boolean
  statusCode: number
  message: string
}

async function deleteStaffFn(id: number): Promise<DeleteStaffResponse> {
  const response = await deleteStaff({ data: { id } })
  return response as unknown as DeleteStaffResponse
}

export function useDeleteStaffMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteStaffFn,
    onSuccess: () => {
      // Invalidate all staff queries to refetch
      queryClient.invalidateQueries({
        queryKey: ['superadmin', 'staff'],
      })
      queryClient.invalidateQueries({
        queryKey: ['staff'],
      })
    },
    onError: (error: any) => {
      console.error('Failed to delete staff:', error)
    },
  })
}
