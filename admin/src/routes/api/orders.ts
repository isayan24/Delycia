import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/orders')({
  server: {
    handlers: {
      PATCH: async ({ request }) => {
        try {
          const data: any = await request.json()
          const { token } = data

          if (!token) {
            return new Response(
              JSON.stringify({
                status: 401,
                message: 'Access token is required',
                error: true,
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          if (!data.order_item_ids) {
            return new Response(
              JSON.stringify({
                status: 400,
                message: 'Order item IDs are required',
                error: true,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          for (const order_id of data.order_item_ids) {
            const submitDate = {
              id: order_id,
              order_status: data.order_status,
              preparation_time: data.preparation_time,
            }

            await axiosInstance.patch(`/admin/orders`, submitDate, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          }

          return new Response(
            JSON.stringify({
              status: 200,
              message: 'Order updated successfully',
              success: true,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          const errorResponse = handleApiError(error, 'Error updating order')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
