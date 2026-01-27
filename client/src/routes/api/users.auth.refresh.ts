import { createFileRoute } from '@tanstack/react-router'
import { getRefreshTokenFromCookie } from '@/lib/server-cookies'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/users/auth/refresh')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Forward Authorization header
          // Get refresh token from httpOnly cookie
          const refreshToken = getRefreshTokenFromCookie(request)
          const authHeader = request.headers.get('Authorization')

          let headers = {}
          if (refreshToken) {
            headers = { Authorization: `Bearer ${refreshToken}` }
          } else if (authHeader) {
            headers = { Authorization: authHeader }
          }

          const response = await axiosInstance.post(
            '/users/auth/refresh',
            null,
            { headers },
          )
          return Response.json(response.data)
        } catch (error: any) {
          console.error('Error in refresh tokens:', error)
          return Response.json(
            { error: 'Failed to refresh tokens' },
            { status: error.response?.status || 500 },
          )
        }
      },
    },
  },
})
