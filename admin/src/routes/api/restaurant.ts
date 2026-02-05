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

          // Fetch specific restaurant with token from cookie
          // Use the admin endpoint which has proper auth checks
          const response = await axiosInstance.get(
            `/admin/restaurants${rid ? `?rid=${rid}` : ''}`,
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
      PATCH: async ({ request }) => {
        try {
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

          const body = await request.json()

          // Use the admin endpoint for PATCH
          const response = await axiosInstance.patch(
            '/admin/restaurants',
            body,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            },
          )

          return new Response(
            JSON.stringify({
              statusCode: response.data?.statusCode || 200,
              message: response.data?.message || 'Updated!',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error: any) {
          console.error('Error updating restaurant:', error)
          return new Response(
            JSON.stringify({
              statusCode: error.response?.status || 500,
              message:
                error.response?.data?.message ||
                'Failed to update restaurant details',
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
