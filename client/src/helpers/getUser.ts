// getUser.ts
'use client'
import axiosInstance from '@/lib/axios'
import { getCookie } from 'cookies-next'
import { createTempSession } from './createTempSession'
import tokenService from '@/services/tokenService'

export const getUser = async (accessToken?: string) => {
  try {
    // Use provided token or get a fresh valid token
    const token = accessToken || (await tokenService.getValidAccessToken())
    if (!token) {
      throw new Error('No access token available')
    }

    const response = await axiosInstance.get('/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // If user exists, check for auth code and create temp session
    if (response.data) {
      const tableCode = getCookie('code')

      if (tableCode) {
        console.log('User and auth code both exist, creating temp session...')
        await createTempSession(response.data.user, tableCode)
      }
    }

    return response.data
  } catch (error: any) {
    // Silently handle error and return null instead of throwing
    return null
  }
}
