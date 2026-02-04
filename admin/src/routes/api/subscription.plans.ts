import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/subscription/plans')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          // Get token from httpOnly cookie
          const accessToken = getAccessTokenFromCookie(request)

          if (!accessToken) {
            return new Response(
              JSON.stringify({
                statusCode: 401,
                message: 'Not authenticated',
                error: true,
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Fetch plans from backend
          const response = await axiosInstance.get(
            `/admin/subscriptions/plans`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          )

          return new Response(
            JSON.stringify({
              statusCode: 200,
              message: 'success',
              plans: response.data?.plans || [],
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error: any) {
          console.error('Error fetching plans:', error)
          return new Response(
            JSON.stringify({
              statusCode: error.response?.status || 500,
              message: error.response?.data?.message || 'Failed to fetch plans',
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
