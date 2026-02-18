import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/inventory-stats')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          // Parse URL to get query params
          const url = new URL(request.url)
          const rid = url.searchParams.get('rid')
          const itemId = url.searchParams.get('itemId')
          const page = url.searchParams.get('page')
          const limit = url.searchParams.get('limit')

          if (!rid || !itemId) {
            return jsonResponse(
              {
                status: 400,
                message:
                  'Restaurant ID (rid) and Item ID (itemId) are required',
                error: true,
              },
              400,
            )
          }

          try {
            // Build backend URL
            const backendUrl = `/admin/inventory-stats/${itemId}`
            // Make request to backend with token
            const response = await axiosInstance.get(backendUrl, {
              params: { rid, page, limit },
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
            const errorResponse = handleApiError(
              error,
              'Error fetching inventory stats',
            )
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
