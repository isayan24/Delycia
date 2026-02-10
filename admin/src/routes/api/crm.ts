import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/crm')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
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

          try {
            const response = await axiosInstance.get('/admin/crm/list', {
              params: { rid, timeRange },
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })

            return jsonResponse(response.data, 200, authHeaders)
          } catch (error) {
            const errorResponse = handleApiError(error, 'Error fetching CRM data')
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
