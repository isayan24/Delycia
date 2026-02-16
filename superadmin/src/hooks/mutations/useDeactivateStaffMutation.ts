import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deactivateStaff } from '@/lib/api/staff'

interface DeactivateStaffResponse {
  status: boolean
  statusCode: number
  message: string
}

async function deactivateStaffFn(id: number): Promise<DeactivateStaffResponse> {
  const response = await deactivateStaff({ data: { id } })
  const result = await response.json()
  return result
}

export function useDeactivateStaffMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deactivateStaffFn,
    onSuccess: () => {
      // Invalidate all staff queries to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'staff'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['staff'] 
      })
    },
    onError: (error: any) => {
      console.error('Failed to deactivate staff:', error)
    },
  })
}
