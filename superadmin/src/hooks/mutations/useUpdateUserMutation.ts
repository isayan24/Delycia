import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUser } from '@/lib/api/users'
import type { UsersResponse } from '@/hooks/queries/useUsersQuery'

interface UpdateUserData {
  id: number
  name?: string
  email?: string
  username?: string
  country_code?: string
  phone_number?: string
  role?: number
  restaurant_ids?: number[]
  profile_pic?: string
}

interface UpdateUserResponse {
  status: boolean
  statusCode: number
  message: string
  data: any
}

async function updateUserFn(data: UpdateUserData): Promise<UpdateUserResponse> {
  const { id, ...updates } = data
  const response = await updateUser({ data: { id, updates } })
  const result = await response.json()
  return result
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUserFn,
    onMutate: async (updatedUser: UpdateUserData) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: ['superadmin', 'users'] 
      })

      // Snapshot the previous value
      const previousUsers = queryClient.getQueriesData<UsersResponse>({ 
        queryKey: ['superadmin', 'users'] 
      })

      // Optimistically update all user queries
      queryClient.setQueriesData<UsersResponse>(
        { queryKey: ['superadmin', 'users'] },
        (old: UsersResponse | undefined) => {
          if (!old) return old

          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((user: any) =>
                user.id === updatedUser.id
                  ? { 
                      ...user, 
                      ...updatedUser,
                    }
                  : user
              ),
            },
          }
        }
      )

      // Return context with the previous data
      return { previousUsers }
    },
    onError: (_error: any, _updatedUser: UpdateUserData, context: any) => {
      // Rollback to the previous value on error
      if (context?.previousUsers) {
        context.previousUsers.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to update user:', _error)
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['superadmin', 'users'] 
      })
    },
  })
}
