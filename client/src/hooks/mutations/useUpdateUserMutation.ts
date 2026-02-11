/**
 * Update User Mutation Hook
 * 
 * Handles updating user profile (name, username, profile_pic).
 * Uses optimistic updates for instant feedback.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { queryKeys } from '@/lib/queryKeys'
import sessionService, { UserData } from '@/services/sessionService'
import type { UpdateUserRequest, UpdateUserResponse } from '@/types/auth.types'

// Extended request type for internal use
interface InternalUpdateUserRequest extends UpdateUserRequest {
  uid: string
  username?: string
  profile_pic?: string
}

// Context type for rollback
interface MutationContext {
  previousUser?: UserData
}

/**
 * Custom hook for updating user profile
 * 
 * Features:
 * - Optimistic cache updates for instant feedback
 * - Automatic rollback on error
 * - Syncs with sessionService
 * - Invalidates queries to refetch full profile
 * 
 * @example
 * const updateUserMutation = useUpdateUserMutation()
 * 
 * updateUserMutation.mutate(
 *   { uid: 'user-123', name: 'John Doe' },
 *   {
 *     onSuccess: () => navigate({ to: '/' }),
 *     onError: (error) => console.error('Update failed:', error),
 *   }
 * )
 */
export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation<UpdateUserResponse, Error, InternalUpdateUserRequest, MutationContext>({
    mutationFn: async (data) => {
      const response = await axios.post('/api/user/update', data)
      return response.data
    },
    // Optimistic update for instant feedback
    onMutate: async (newData) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.user() })

      // Snapshot the previous value for rollback
      const previousUser = queryClient.getQueryData<UserData>(queryKeys.auth.user())

      // Optimistically update the cache
      queryClient.setQueryData<UserData | null>(
        queryKeys.auth.user(),
        (old) => {
          if (!old) return null
          return {
            ...old,
            name: newData.name || old.name,
            username: newData.username || old.username,
            profile_pic: newData.profile_pic || old.profile_pic,
          }
        }
      )

      // Return context with previous value for rollback
      return { previousUser }
    },
    onSuccess: async (response, variables) => {
      console.log('[useUpdateUserMutation] Update successful, response:', response)
      
      // Refetch user data from server to ensure consistency
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() })
      
      // Wait for refetch to complete
      await queryClient.refetchQueries({ queryKey: queryKeys.auth.user() })
      
      // Get the updated user data
      const updatedUser = queryClient.getQueryData<UserData>(queryKeys.auth.user())
      if (updatedUser) {
        sessionService.setUserData(updatedUser)
        console.log('[useUpdateUserMutation] User data synced:', updatedUser)
      }

      console.log('[useUpdateUserMutation] User updated successfully', {
        name: variables.name,
        username: variables.username,
      })
    },
    onError: (error, _, context) => {
      // Rollback to previous value on error
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.auth.user(), context.previousUser)
        sessionService.setUserData(context.previousUser)
      }

      console.error('[useUpdateUserMutation] Update failed, rolled back', error)
    },
    retry: 2, // Retry on network errors
  })
}
