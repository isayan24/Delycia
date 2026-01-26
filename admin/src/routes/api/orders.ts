import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/orders')({
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
          const limit = url.searchParams.get('limit')

          // Make request to backend with token from cookie
          const response = await axiosInstance.get('/admin/orders', {
            params: { rid, limit },
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
            'Error fetching order history',
          )
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
      PATCH: async ({ request }) => {
        try {
          // Get token from httpOnly cookie instead of request body
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

          const data: any = await request.json()

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
                Authorization: `Bearer ${accessToken}`,
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

          const data: any = await request.json()
          const { action } = data

          if (action === 'merge') {
            const { cart_ids, target_cart_id } = data
            const response = await axiosInstance.post(
              '/admin/orders/merge',
              { cart_ids, target_cart_id },
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
          }

          return new Response(
            JSON.stringify({
              status: 400,
              message: 'Invalid action',
              error: true,
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          const errorResponse = handleApiError(
            error,
            'Error processing request',
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
