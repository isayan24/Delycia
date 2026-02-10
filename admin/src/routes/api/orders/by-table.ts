import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/orders/by-table')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            const data: {
              table_id: number
              rid: string
            } = await request.json()

            if (!data.table_id || !data.rid) {
              return jsonResponse(
                {
                  status: 400,
                  message: 'table_id and rid are required',
                  error: true,
                },
                400,
              )
            }

            // Call the backend endpoint to get orders by table
            const response = await axiosInstance.post(
              '/admin/orders/by-table',
              {
                table_id: data.table_id,
                rid: data.rid,
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              },
            )

            return jsonResponse(response.data, 200, authHeaders)
          } catch (error) {
            const errorResponse = handleApiError(
              error,
              'Error fetching table orders',
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
