import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'

interface UpdateUserVariables {
  uid: string
  accessToken: string
  name?: string
  username?: string
  profile_pic?: string
  phone_number?: string
  // Add other fields as needed
}

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: UpdateUserVariables) => {
      const response = await axiosInstance.post('/user/update', variables)
      return response.data
    },
    onSuccess: () => {
      // Invalidate user query if it exists
      // queryClient.invalidateQueries(['user'])
    },
  })
}
