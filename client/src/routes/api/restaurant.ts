import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/restaurant')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const endpoint = `/restaurant${url.search}`
          const response = await axiosInstance.get(endpoint)
          return Response.json(response.data)
        } catch (error: any) {
          console.error('Error fetching restaurant:', error)
          return Response.json(
            { error: 'Failed to fetch restaurant' },
            { status: 500 },
          )
        }
      },
    },
  },
})
