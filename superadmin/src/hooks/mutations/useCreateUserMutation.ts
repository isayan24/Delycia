import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUser } from '@/lib/api/users'
import type { UserFormData } from '@/schemas/userSchema'

interface CreateUserResponse {
  status: boolean
  statusCode: number
  message: string
  data: {
    id: number
    uid: string
    name: string
    email: string | null
    username: string
    country_code: string
    phone_number: string
    profile_pic: string | null
    role: number
    register_at: string
    restaurant_ids: number[]
  }
}

async function createUserFn(data: UserFormData): Promise<CreateUserResponse> {
  const response = await createUser({ data })
  const result = await response.json()
  return result
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUserFn,
    onSuccess: (response) => {
      // Invalidate all user queries to refetch with the new user
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'users'] 
      })
    },
    onError: (error: any) => {
      console.error('Failed to create user:', error)
    },
  })
}
