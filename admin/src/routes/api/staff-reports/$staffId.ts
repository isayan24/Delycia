import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'
import { handleApiError } from '@/helpers/handleApiError'

export const Route = createFileRoute('/api/staff-reports/$staffId')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const { staffId } = params

            // Parse URL to get query parameters
            const url = new URL(req.url)
            const queryParams = url.searchParams.toString()

            // Forward request to backend
            const response = await axiosInstance.get(
              `/admin/staff-reports/${staffId}/orders?${queryParams}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              },
            )

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
            console.error('Staff orders error:', error)
            const errorResponse = handleApiError(
              error,
              'Failed to fetch staff orders',
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
