import { createFileRoute } from '@tanstack/react-router'
import { jsonResponse, withAuth, isTokenExpiredError } from '@/lib/withAuth'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/tables')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(
          request,
          async (accessToken) => {
            try {
              const url = new URL(request.url)
              const rid = url.searchParams.get('rid')
              const type = url.searchParams.get('type')
              const tableId = url.searchParams.get('tableId')

              if (!rid) {
                return jsonResponse({ error: 'Restaurant ID is required' }, 400)
              }

              let endpoint = `/tables?rid=${rid}${type ? `&type=${type}` : ''}`

              // If tableId is provided, use the specific details endpoint
              if (tableId) {
                endpoint = `/tables/details?rid=${rid}&tableId=${tableId}`
              }

              const response = await axiosInstance.get(endpoint, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              })

              return jsonResponse(response.data, 200)
            } catch (error: any) {
              if (isTokenExpiredError(error)) throw error
              console.error('Error fetching tables:', error)
              return jsonResponse(
                { error: error.message || 'Failed to fetch tables' },
                500,
              )
            }
          },
          { requireAuth: false }, // Allow public access
        )
      },
    },
  },
})
