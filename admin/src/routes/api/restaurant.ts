import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'
import { handleApiError } from '@/helpers/handleApiError'

export const Route = createFileRoute('/api/restaurant')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            // Get rid from query parameters
            const url = new URL(req.url)
            const rid = url.searchParams.get('rid')

            // Fetch specific restaurant with token from cookie
            // Use the admin endpoint which has proper auth checks
            const response = await axiosInstance.get(
              `/admin/restaurants${rid ? `?rid=${rid}` : ''}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              },
            )

            return jsonResponse(
              {
                statusCode: 200,
                message: 'success',
                restaurant_info: response.data?.restaurant_info || response.data,
                restaurant_hours: response.data?.restaurant_hours || [],
              },
              200,
              authHeaders,
            )
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
              'Error fetching restaurant',
            )
            return jsonResponse(
              {
                statusCode: (errorResponse as any).status || 500,
                message:
                  error.response?.data?.message ||
                  'Failed to fetch restaurant details',
                error: true,
              },
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
      PATCH: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const body = await req.json()

            // Use the admin endpoint for PATCH
            const response = await axiosInstance.patch(
              '/admin/restaurants',
              body,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              },
            )

            return jsonResponse(
              {
                statusCode: response.data?.statusCode || 200,
                message: response.data?.message || 'Updated!',
              },
              200,
              authHeaders,
            )
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
              'Error updating restaurant',
            )
            return jsonResponse(
              {
                statusCode: (errorResponse as any).status || 500,
                message:
                  error.response?.data?.message ||
                  'Failed to update restaurant details',
                error: true,
              },
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
    },
  },
})
