import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/crm/stats')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            const url = new URL(request.url)
            const rid = url.searchParams.get('rid')
            const timeRange = url.searchParams.get('timeRange')

            if (!rid) {
              return jsonResponse(
                {
                  status: 400,
                  message: 'Restaurant ID is required',
                  error: true,
                },
                400,
              )
            }

            const response = await axiosInstance.get('/admin/crm/stats', {
              params: { rid, timeRange },
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })

            return jsonResponse(response.data, 200, authHeaders)
          } catch (error:any) {
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error // Let withAuth handle auth errors
            }

            const errorResponse = handleApiError(
              error,
              'Error fetching CRM stats',
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
