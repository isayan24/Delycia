import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/inventory-stats')({
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
          const rid = url.searchParams.get('rid')
          const itemId = url.searchParams.get('itemId')
          const page = url.searchParams.get('page')
          const limit = url.searchParams.get('limit')

          if (!rid || !itemId) {
            return new Response(
              JSON.stringify({
                status: 400,
                message:
                  'Restaurant ID (rid) and Item ID (itemId) are required',
                error: true,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Build backend URL
          const backendUrl = `/admin/inventory-stats/${itemId}`

          // Make request to backend with token from cookie
          const response = await axiosInstance.get(backendUrl, {
            params: { rid, page, limit },
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Error in GET /api/inventory-stats:', error)
          const errorResponse = handleApiError(
            error,
            'Error fetching inventory stats',
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
