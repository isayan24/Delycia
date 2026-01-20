import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/dashboard')({
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

          // Parse URL to get query params
          const url = new URL(request.url)
          const endpoint = url.searchParams.get('endpoint') // e.g., 'stats', 'sales-trend', etc.
          const rid = url.searchParams.get('rid')
          const startDate = url.searchParams.get('startDate')
          const endDate = url.searchParams.get('endDate')
          const filter = url.searchParams.get('filter')

          if (!endpoint) {
            return new Response(
              JSON.stringify({
                status: 400,
                message: 'Endpoint parameter is required',
                error: true,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Build backend URL
          const backendUrl = `/admin/dashboard/${endpoint}`

          // Make request to backend with token from cookie
          const response = await axiosInstance.get(backendUrl, {
            params: { rid, startDate, endDate, filter },
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const errorResponse = handleApiError(
            error,
            'Error fetching dashboard data',
          )
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
