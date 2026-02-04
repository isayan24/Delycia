import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/subscription')({
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

          // Get rid from query parameters
          const url = new URL(request.url)
          const rid = url.searchParams.get('rid')

          if (!rid) {
            return new Response(
              JSON.stringify({
                statusCode: 400,
                message: 'Restaurant ID is required',
                error: true,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Fetch subscription from backend
          const response = await axiosInstance.get(
            `/admin/subscriptions?rid=${rid}`,
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
              subscription: response.data?.subscription || null,
              has_subscription: response.data?.has_subscription || false,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error: any) {
          console.error('Error fetching subscription:', error)
          return new Response(
            JSON.stringify({
              statusCode: error.response?.status || 500,
              message:
                error.response?.data?.message ||
                'Failed to fetch subscription details',
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
