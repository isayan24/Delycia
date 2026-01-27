import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/server-axios'

export const Route = createFileRoute('/api/users/auth/handleAuth')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          // Ensure body is forwarded correctly
          const response = await axiosInstance.post(
            '/users/auth/handleAuth',
            body,
          )
          return Response.json(response.data)
        } catch (error: any) {
          console.error('Error in handleAuth:', error)
          return Response.json(
            { error: 'Failed to handle auth' },
            { status: error.response?.status || 500 },
          )
        }
      },
    },
  },
})
