import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/orders')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const endpoint = `/orders${url.search}`
          // Forward Authorization header if present
          const authHeader = request.headers.get('Authorization')
          const headers = authHeader ? { Authorization: authHeader } : {}

          const response = await axiosInstance.get(endpoint, { headers })
          return Response.json(response.data)
        } catch (error: any) {
          console.error('Error fetching orders:', error)
          return Response.json(
            { error: 'Failed to fetch orders' },
            { status: 500 },
          )
        }
      },
    },
  },
})
