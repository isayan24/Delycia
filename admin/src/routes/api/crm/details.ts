import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/crm/details')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const url = new URL(req.url)
            const rid = url.searchParams.get('rid')
            const customerId = url.searchParams.get('customerId')

            if (!rid || !customerId) {
              return jsonResponse(
                {
                  status: 400,
                  message: 'Restaurant ID and Customer ID are required',
                  error: true,
                },
                400,
              )
            }

            const response = await axiosInstance.get('/admin/crm/details', {
              params: { rid, customerId },
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
              'Error fetching customer details',
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
