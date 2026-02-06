import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { handleApiError } from '@/helpers/handleApiError'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/variants')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          // Parse query params
          const url = new URL(request.url)
          const inventoryId = url.searchParams.get('inventory_id')

          if (!inventoryId) {
            return new Response(
              JSON.stringify({
                status: 400,
                message: 'Inventory ID is required',
                error: true,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Get token from httpOnly cookie
          const token = getAccessTokenFromCookie(request)

          // Call backend
          // Assuming backend has /variants endpoint.
          // If not, we might need to use /inventory/{id}/variants or similar.
          // But usually variants are fetched via query param on /variants or /inventory/variants
          // Based on previous code: /api/variants?inventory_id=...

          const params = { inventory_id: inventoryId }

          const response = await axiosInstance.get('/variants', {
            params,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          })

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Error in GET /api/variants:', error)
          const errorResponse = handleApiError(error, 'fetching variants')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
