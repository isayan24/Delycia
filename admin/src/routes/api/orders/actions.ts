import { createFileRoute } from '@tanstack/react-router'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'
import axiosInstance from '@/lib/axios'
import { handleApiError } from '@/helpers/handleApiError'

export const Route = createFileRoute('/api/orders/actions')({
  server: {
    handlers: {
      // POST /api/orders/actions - Handle order accept/reject/update
      POST: async ({ request }) => {
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
              return new Response(
                JSON.stringify({
                  status: 400,
                  message: 'Invalid action',
                  error: true,
                }),
                {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' },
                },
              )
          }

          const method = action === 'update-time' ? 'put' : 'post'
          const response = await axiosInstance[method](endpoint, payload, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const errorResponse = handleApiError(error, 'Order action failed')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
