/**
 * Direct Login Mutation Hook (Backup No-OTP/Magic-Link)
 *
 * Handles immediate authentication and name update.
 * Steps:
 * 1. Login/Register via phone number (BFF /api/auth/login)
 * 2. Update user name (BFF /api/user.update)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { queryKeys } from '@/lib/queryKeys'
import sessionService, { UserData } from '@/services/sessionService'

export interface DirectLoginRequest {
  phone_number: string
  country_code: string
  name: string
}

export function useDirectLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation<UserData, Error, DirectLoginRequest>({
    mutationFn: async ({ phone_number, country_code, name }) => {
      // 1. Authenticate with phone number
      const loginResponse = await axios.post('/api/auth/login', {
        phone_number,
        country_code,
      })

      if (loginResponse.status !== 200 || !loginResponse.data?.data?.user) {
        throw new Error(loginResponse.data?.message || 'Login failed')
      }

      const user = loginResponse.data.data.user
      // 2. Update name immediately
      try {
        await axios.patch('/api/user/update', {
          id: user.id || user.uid,
          name: name,
        })

        // Return updated user object
        const updatedUser = { ...user, name }
        sessionService.setUserData(updatedUser)

        return updatedUser
      } catch (updateError) {
        console.warn('Login successful but name update failed:', updateError)
        // Return original user if name update fails (better than failing entirely)
        sessionService.setUserData(user)
        return user
      }
    },
    onSuccess: (userData) => {
      // Update the auth query cache directly
      queryClient.setQueryData(queryKeys.auth.user(), userData)
    },
  })
}
