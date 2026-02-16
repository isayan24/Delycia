import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deactivateUser } from '@/lib/api/users'
import { toast } from 'sonner'

export function useDeactivateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deactivateUser({ data: { id } }),
    onSuccess: async (response) => {
      const data = await response.json()
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'users'] })
      toast.success(data.message || 'User deactivated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to deactivate user')
    },
  })
}
