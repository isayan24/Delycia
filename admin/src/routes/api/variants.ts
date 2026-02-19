import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { handleApiError } from '@/helpers/handleApiError'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/variants')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            // Parse query params
            const url = new URL(req.url)
            const inventoryId = url.searchParams.get('inventory_id')

            if (!inventoryId) {
              return jsonResponse(
                {
                  status: 400,
                  message: 'Inventory ID is required',
                  error: true,
                },
                400,
              )
            }

            const params = { inventory_id: inventoryId }

            const response = await axiosInstance.get('/variants', {
              params,
              headers: { Authorization: `Bearer ${accessToken}` },
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
            console.error('Error in GET /api/variants:', error)
            const errorResponse = handleApiError(error, 'fetching variants')
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
