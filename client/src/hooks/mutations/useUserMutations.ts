import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import axios from 'axios'

interface UpdateUserVariables {
  uid: string
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
      const response = await axios.post('/api/user/update', variables)
      return response.data
    },
    onSuccess: () => {
      // Invalidate user query if it exists
      // queryClient.invalidateQueries(['user'])
    },
  })
}
