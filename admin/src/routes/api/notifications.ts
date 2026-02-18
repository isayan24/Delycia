import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/notifications')({
  server: {
    handlers: {
      // GET - Fetch notifications
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          const url = new URL(request.url)
          const rid = url.searchParams.get('rid')
          const page = url.searchParams.get('page')
          const limit = url.searchParams.get('limit')
          const type = url.searchParams.get('type')
          const is_read = url.searchParams.get('is_read')

          try {
            const response = await axiosInstance.get('/admin/notifications', {
              params: { rid, page, limit, type, is_read },
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
              'Error fetching notifications',
            )
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },

      // PATCH - Mark all notifications as read
      PATCH: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            const data: any = await request.json()
            const { rid } = data

            const response = await axiosInstance.patch(
              '/admin/notifications/read-all',
              { rid },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
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
            const errorResponse = handleApiError(
              error,
              'Error marking all notifications as read',
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
