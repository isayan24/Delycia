import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/orders/order-history')({
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
          const page = url.searchParams.get('page')
          const limit = url.searchParams.get('limit')
          const search = url.searchParams.get('search')
          const start_date = url.searchParams.get('start_date')
          const end_date = url.searchParams.get('end_date')

          // Build query params object
          const params: Record<string, string> = {}
          if (rid) params.rid = rid
          if (page) params.page = page
          if (limit) params.limit = limit
          if (search) params.search = search
          if (start_date) params.start_date = start_date
          if (end_date) params.end_date = end_date

          // Make request to backend with token from cookie
          const response = await axiosInstance.get('/admin/orders/history', {
            params,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          })
        } catch (error) {
          const errorResponse = handleApiError(
            error,
            'Error fetching order history',
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
