import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/dashboard')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          // Parse URL to get query params
          const url = new URL(request.url)
          const endpoint = url.searchParams.get('endpoint')
          const rid = url.searchParams.get('rid')
          const startDate = url.searchParams.get('startDate')
          const endDate = url.searchParams.get('endDate')
          const filter = url.searchParams.get('filter')

          if (!endpoint) {
            return jsonResponse(
              {
                status: 400,
                message: 'Endpoint parameter is required',
                error: true,
              },
              400,
            )
          }

          try {
            // Build backend URL
            const backendUrl = `/admin/dashboard/${endpoint}`

            // Make request to backend with token
            const response = await axiosInstance.get(backendUrl, {
              params: { rid, startDate, endDate, filter },
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })

            return jsonResponse(response.data, 200, authHeaders)
          } catch (error) {
            const errorResponse = handleApiError(
              error,
              'Error fetching dashboard data',
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
