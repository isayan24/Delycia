import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/restaurant')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          // Get token from httpOnly cookie
          const accessToken = getAccessTokenFromCookie(request)

          if (!accessToken) {
            return new Response(
              JSON.stringify({
                status: 401,
                message: 'Not authenticated',
                error: true,
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Get rid from query parameters
          const url = new URL(request.url)
          const rid = url.searchParams.get('rid')

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

          // Fetch specific restaurant with token from cookie
          const response = await axiosInstance.get(`/restaurant?rid=${rid}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

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
