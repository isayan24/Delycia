import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'
import { handleApiError } from '@/helpers/handleApiError'

export const Route = createFileRoute('/api/subscription/plans')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            // Fetch plans from backend
            const response = await axiosInstance.get(
              `/admin/subscriptions/plans`,
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
                plans: response.data?.plans || [],
              },
              200,
              authHeaders,
            )
          } catch (error) {
            const errorResponse = handleApiError(
              error,
              'Error fetching plans',
            )
            return jsonResponse(
              errorResponse,
              errorResponse.status || 500,
              authHeaders,
            )
          }
        })
      },
    },
  },
})
