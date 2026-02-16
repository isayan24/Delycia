import { useMutation, useQueryClient } from '@tanstack/react-query'
import { resetUserPassword } from '@/lib/api/users'
import { toast } from 'sonner'

export function useResetPasswordMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => resetUserPassword({ data: { id } }),
    onSuccess: async (response) => {
      const data = await response.json()
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'users'] })
      toast.success(data.message || 'Password reset successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reset password')
    },
  })
}
