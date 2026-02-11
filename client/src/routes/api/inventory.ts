import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/inventory')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            const url = new URL(request.url)
            const endpoint = `/inventory${url.search}`
            const response = await axiosInstance.get(endpoint, {
              headers: { Authorization: `Bearer ${accessToken}` },
            })
            return jsonResponse(response.data, 200, authHeaders)
          } catch (error: any) {
            console.error('Error fetching inventory:', error)
            return jsonResponse(
              { error: 'Failed to fetch inventory' },
              500,
              authHeaders,
            )
          }
        })
      },
    },
  },
})
