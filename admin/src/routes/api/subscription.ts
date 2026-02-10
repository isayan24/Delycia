import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'
import { handleApiError } from '@/helpers/handleApiError'

export const Route = createFileRoute('/api/subscription')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            // Get rid from query parameters
            const url = new URL(request.url)
            const rid = url.searchParams.get('rid')

            if (!rid) {
              return jsonResponse(
                {
                  statusCode: 400,
                  message: 'Restaurant ID is required',
                  error: true,
                },
                400,
              )
            }

            // Fetch subscription from backend
            const response = await axiosInstance.get(
              `/admin/subscriptions?rid=${rid}`,
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
                subscription: response.data?.subscription || null,
                has_subscription: response.data?.has_subscription || false,
                is_in_grace_period: response.data?.is_in_grace_period || false,
                is_hard_blocked: response.data?.is_hard_blocked || false,
                grace_period_days_remaining:
                  response.data?.grace_period_days_remaining || 0,
              },
              200,
              authHeaders,
            )
          } catch (error: any) {
            const errorResponse = handleApiError(
              error,
              'Error fetching subscription',
            )
            return jsonResponse(
              {
                statusCode: (errorResponse as any).status || 500,
                message:
                  error.response?.data?.message ||
                  'Failed to fetch subscription details',
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
