import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/server-axios'

export const Route = createFileRoute('/api/users/auth/refresh')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Forward Authorization header
          const authHeader = request.headers.get('Authorization')
          const headers = authHeader ? { Authorization: authHeader } : {}

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
