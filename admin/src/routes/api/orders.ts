import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/orders')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            // Parse URL to get query params
            const url = new URL(req.url)
            const rid = url.searchParams.get('rid')
            const limit = url.searchParams.get('limit')

            // Make request to backend with token from cookie
            const response = await axiosInstance.get('/admin/orders', {
              params: { rid, limit },
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })

            return jsonResponse(response.data, 200, authHeaders)
          } catch (error: any) {
            // If it's an auth error (401/403), throw it so withAuth can handle token refresh
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error // Let withAuth handle auth errors
            }

            // For other errors, return a generic error response
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
      PATCH: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const data: any = await req.json()

            if (!data.order_item_ids) {
              return jsonResponse(
                {
                  status: 400,
                  message: 'Order item IDs are required',
                  error: true,
                },
                400,
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

            return jsonResponse(
              {
                status: 200,
                message: 'Order updated successfully',
                success: true,
              },
              200,
              authHeaders,
            )
          } catch (error: any) {
            // If it's an auth error (401/403), throw it so withAuth can handle token refresh
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error // Let withAuth handle auth errors
            }

            // For other errors, return a generic error response
            const errorResponse = handleApiError(error, 'Error updating order')
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },

      POST: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const data: any = await req.json()
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

              return jsonResponse(response.data, 200, authHeaders)
            }

            return jsonResponse(
              {
                status: 400,
                message: 'Invalid action',
                error: true,
              },
              400,
            )
          } catch (error: any) {
            // If it's an auth error (401/403), throw it so withAuth can handle token refresh
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error // Let withAuth handle auth errors
            }

            // For other errors, return a generic error response
            const errorResponse = handleApiError(
              error,
              'Error processing request',
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
