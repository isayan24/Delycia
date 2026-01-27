// getUser.ts
'use client'
import { getCookie } from 'cookies-next'
import { createTempSession } from './createTempSession'
import sessionService from '@/services/sessionService'
import axios from 'axios'

export const getUser = async () => {
  try {
    // If we have a user in session, we can trust it or verify it
    const user = sessionService.getUserData()
    if (!user) {
      // If no local user data, we assume not logged in and don't spam errors
      // But if we want to check server anyway:
      // throw new Error('No user found')
      // Actually, if simply checking session, we can proceed.
    }

    // Call internal route
    const response = await axios.get('/api/auth/session')

    if (response.status !== 200) return null

    const data = response.data

    if (data?.isAuthenticated && data?.data?.user) {
      const userData = data.data.user

      const tableCode = getCookie('code')

      if (tableCode) {
        await createTempSession(userData, tableCode)
      }

      return { user: userData }
    }

    return null
  } catch (error: any) {
    // Silently handle error and return null instead of throwing
    return null
  }
}
