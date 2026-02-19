import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse, isTokenExpiredError } from '@/lib/withAuth'

export const Route = createFileRoute('/api/users')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const response = await axiosInstance.get('/users', {
              headers: { Authorization: `Bearer ${accessToken}` },
            })
            return jsonResponse(response.data, 200, authHeaders)
          } catch (error: any) {
            if (isTokenExpiredError(error)) throw error
            console.error(
              'Error fetching user:',
              error?.response?.data || error.message,
            )
            return jsonResponse(
              { error: 'Failed to fetch user' },
              error?.response?.status || 500,
              authHeaders,
            )
          }
        })
      },
    },
  },
})
