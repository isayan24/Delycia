import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/orders/actions')({
  server: {
    handlers: {
      // POST /api/orders/actions - Handle order accept/reject/update
      POST: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            const body = await request.json()
            const url = new URL(request.url)
            const action = url.searchParams.get('action') // accept, reject, update-time

            let endpoint = ''
            let payload = {}

            switch (action) {
              case 'accept':
                endpoint = '/admin/orders/accept'
                payload = {
                  order_id: body.orderId,
                  preparation_time: body.preparationTime,
                  rid: body.restaurantId,
                }
                break
              case 'reject':
                endpoint = '/admin/orders/reject'
                payload = {
                  order_id: body.orderId,
                  reason: body.reason || 'Order rejected by admin',
                  rid: body.restaurantId,
                }
                break
              case 'update-time':
                endpoint = `/admin/orders/${body.orderId}/preparation-time`
                payload = {
                  preparation_time: body.preparationTime,
                }
                break
              case 'settle-customer':
                endpoint = '/admin/orders/settle-customer'
                payload = {
                  customer_id: body.customerId,
                  table_id: body.tableId,
                  rid: body.restaurantId,
                }
                break
              default:
                return jsonResponse(
                  {
                    status: 400,
                    message: 'Invalid action',
                    error: true,
                  },
                  400,
                )
            }

            const method = action === 'update-time' ? 'put' : 'post'
            const response = await axiosInstance[method](endpoint, payload, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })

            return jsonResponse(response.data, 200, authHeaders)
          } catch (error) {
            const errorResponse = handleApiError(error, 'Order action failed')
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
