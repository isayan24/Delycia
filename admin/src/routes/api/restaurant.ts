import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/restaurant')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          // Get from Authorization header
          const authHeader = request.headers.get('authorization')
          let accessToken: string | null = null

          if (authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.substring(7)
          }

          if (!accessToken) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          // Get rid from query parameters
          const url = new URL(request.url)
          const rid = url.searchParams.get('rid')

          // Set up axios headers
          axiosInstance.defaults.headers.common['Authorization'] =
            `Bearer ${accessToken}`

          if (!rid) {
            // If no rid provided, return empty array
            // Note: In TanStack Start, we don't have session available like in Next.js
            // This functionality would need to be handled differently
            return new Response(
              JSON.stringify({
                statusCode: 200,
                message: 'No restaurants found',
                restaurants: [],
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Fetch specific restaurant
          const response = await axiosInstance.get(`/restaurant?rid=${rid}`)

          return new Response(
            JSON.stringify({
              statusCode: 200,
              message: 'success',
              restaurant_info: response.data?.restaurant_info || response.data,
              restaurant_hours: response.data?.restaurant_hours || [],
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error: any) {
          console.error('Error fetching restaurant:', error)
          return new Response(
            JSON.stringify({
              statusCode: error.response?.status || 500,
              message:
                error.response?.data?.message ||
                'Failed to fetch restaurant details',
              error: true,
            }),
            {
              status: error.response?.status || 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }
      },
    },
  },
})
