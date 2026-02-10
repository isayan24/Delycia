import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'
import { handleApiError } from '@/helpers/handleApiError'

export const Route = createFileRoute('/api/staff-reports')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            // Parse URL to get query parameters
            const url = new URL(request.url)
            const queryParams = url.searchParams.toString()

            // Forward request to backend
            const response = await axiosInstance.get(
              `/admin/staff-reports/leaderboard?${queryParams}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              },
            )

            return jsonResponse(response.data, 200, authHeaders)
          } catch (error) {
            const errorResponse = handleApiError(
              error,
              'Error fetching staff reports',
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
