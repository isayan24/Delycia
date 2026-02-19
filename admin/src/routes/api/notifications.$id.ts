import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/notifications/$id')({
  server: {
    handlers: {
      // PATCH - Mark single notification as read
      PATCH: async ({ request, params }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const { id } = params
            const data: any = await req.json()
            const { rid } = data

            const response = await axiosInstance.patch(
              `/admin/notifications/${id}/read`,
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
              'Error marking notification as read',
            )
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },

      // DELETE - Delete a notification
      DELETE: async ({ request, params }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const { id } = params
            const data: any = await req.json()
            const { rid } = data

            const response = await axiosInstance.delete(
              `/admin/notifications/${id}`,
              {
                data: { rid },
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
              'Error deleting notification',
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
