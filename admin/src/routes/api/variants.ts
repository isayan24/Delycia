import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { handleApiError } from '@/helpers/handleApiError'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/variants')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            // Parse query params
            const url = new URL(request.url)
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
          } catch (error) {
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
