import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'

import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/orders')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const endpoint = `/orders${url.search}`

          console.log(endpoint, 'endpoint')

          const token = getAccessTokenFromCookie(request)
          const headers = token ? { Authorization: `Bearer ${token}` } : {}

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
