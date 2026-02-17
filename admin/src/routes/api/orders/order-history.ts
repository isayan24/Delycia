import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/orders/order-history')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            // Parse URL to get query params
            const url = new URL(request.url)
            const rid = url.searchParams.get('rid')
            const page = url.searchParams.get('page')
            const limit = url.searchParams.get('limit')
            const search = url.searchParams.get('search')
            const start_date = url.searchParams.get('start_date')
            const end_date = url.searchParams.get('end_date')
            const filter_type = url.searchParams.get('filter_type')

            // Build query params object
            const params: Record<string, string> = {}
            if (rid) params.rid = rid
            if (page) params.page = page
            if (limit) params.limit = limit
            if (search) params.search = search
            if (start_date) params.start_date = start_date
            if (end_date) params.end_date = end_date
            if (filter_type) params.filter_type = filter_type

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
                ...Object.fromEntries(authHeaders.entries()),
              },
            })
          } catch (error) {
            const errorResponse = handleApiError(
              error,
              'Error fetching order history',
            )
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
    },
  },
})
