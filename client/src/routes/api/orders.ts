import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/orders')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            const url = new URL(request.url)
            const endpoint = `/orders${url.search}`

            const response = await axiosInstance.get(endpoint, {
              headers: { Authorization: `Bearer ${accessToken}` },
            })
            return jsonResponse(response.data, 200, authHeaders)
          } catch (error: any) {
            console.error('Error fetching orders:', error)
            return jsonResponse(
              { error: 'Failed to fetch orders' },
              500,
              authHeaders,
            )
          }
        })
      },
    },
  },
})
