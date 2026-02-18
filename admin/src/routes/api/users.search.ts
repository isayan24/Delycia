import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/users/search')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          // Extract query params
          const url = new URL(request.url)
          const name = url.searchParams.get('name')
          const rid = url.searchParams.get('rid')

          // Validate required params
          if (!name || name.trim().length < 2) {
            return jsonResponse(
              {
                status: 400,
                message: 'Search term must be at least 2 characters',
                error: true,
                users: [],
              },
              400,
            )
          }

          try {
            // Call backend API with authentication
            const response = await axiosInstance.get('/users/search', {
              params: { name, rid },
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })

            return jsonResponse(response.data, 200, authHeaders)
          } catch (error: any) {
            // If it's an auth error (401/403), throw it so withAuth can handle token refresh
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error // Let withAuth handle auth errors
            }

            // For other errors, return a generic error response
            const errorResponse = handleApiError(error, 'Failed to search users')
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
    },
  },
})
