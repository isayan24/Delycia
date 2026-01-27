import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/users')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const authHeader = request.headers.get('Authorization')
          const response = await axiosInstance.get('/users', {
            headers: {
              ...(authHeader ? { Authorization: authHeader } : {}),
            },
          })
          return Response.json(response.data)
        } catch (error: any) {
          console.error(
            'Error fetching user:',
            error?.response?.data || error.message,
          )
          return Response.json(
            { error: 'Failed to fetch user' },
            { status: error?.response?.status || 500 },
          )
        }
      },
    },
  },
})
