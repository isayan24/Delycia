import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/orders/by-table')({
  server: {
    handlers: {
      POST: async ({ request }) => {
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

          const data: {
            table_no: number
            rid: string
          } = await request.json()

          if (!data.table_no || !data.rid) {
            return new Response(
              JSON.stringify({
                status: 400,
                message: 'table_no and rid are required',
                error: true,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Call the backend endpoint to get orders by table
          const response = await axiosInstance.post(
            '/admin/orders/by-table',
            {
              table_no: data.table_no,
              rid: data.rid,
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          )

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const errorResponse = handleApiError(
            error,
            'Error fetching table orders',
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
