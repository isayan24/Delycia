import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/inventory')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const endpoint = `/inventory${url.search}`
          const response = await axiosInstance.get(endpoint)
          return Response.json(response.data)
        } catch (error: any) {
          console.error('Error fetching inventory:', error)
          return Response.json(
            { error: 'Failed to fetch inventory' },
            { status: 500 },
          )
        }
      },
    },
  },
})
