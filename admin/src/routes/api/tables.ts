import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/tables')({
  server: {
    handlers: {
      /**
       * GET /api/tables - Fetch tables or zones for a restaurant
       * Query params:
       *   - rid: Restaurant ID (required)
       *   - type: 'tables' | 'zones' (default: 'tables')
       */
      GET: async ({ request }) => {
        // Tables endpoint doesn't require auth (public data)
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const url = new URL(req.url)
            const rid = url.searchParams.get('rid')
            const type = url.searchParams.get('type') || 'tables'

            if (!rid) {
              return new Response(
                JSON.stringify({
                  status: 400,
                  message: 'Restaurant ID (rid) is required',
                  error: true,
                }),
                {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' },
                },
              )
            }

            const endpoint = type === 'zones' ? '/tables/zones' : '/tables'
            const response = await axiosInstance.get(endpoint, {
              params: { rid },
            })

            return new Response(JSON.stringify(response.data), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          } catch (error: any) {
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error // Let withAuth handle auth errors
            }

            const errorResponse = handleApiError(error, 'fetching tables')
            return new Response(JSON.stringify(errorResponse), {
              status: (errorResponse as any).status || 500,
              headers: { 'Content-Type': 'application/json' },
            })
          }
        })
      },

      /**
       * POST /api/tables - Create a new table
       * Body: { rid, table_number, capacity, zone }
       */
      POST: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const body = await req.json()
            const { rid, table_number, capacity, zone } = body

            if (!rid || !table_number || !capacity || !zone) {
              return jsonResponse(
                {
                  status: 400,
                  message:
                    'Missing required fields: rid, table_number, capacity, zone',
                  error: true,
                },
                400,
              )
            }

            await axiosInstance.post(
              '/admin/tables',
              { rid, table_number, capacity, zone },
              { headers: { Authorization: `Bearer ${accessToken}` } },
            )

            return jsonResponse(
              {
                status: 201,
                message: 'Table created successfully',
                success: true,
              },
              201,
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
            const errorResponse = handleApiError(error, 'creating table')
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },

      /**
       * PATCH /api/tables - Update a table
       * Body: { id, status, capacity?, zone? }
       */
      PATCH: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const body = await req.json()
            const { id, status, capacity, zone } = body

            if (!id) {
              return jsonResponse(
                {
                  status: 400,
                  message: 'Table ID is required',
                  error: true,
                },
                400,
              )
            }

            await axiosInstance.patch(
              '/admin/tables',
              { id, status, capacity, zone },
              { headers: { Authorization: `Bearer ${accessToken}` } },
            )

            return jsonResponse(
              {
                status: 200,
                message: 'Table updated successfully',
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
            const errorResponse = handleApiError(error, 'updating table')
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },

      /**
       * DELETE /api/tables - Delete a table
       * Body: { id }
       */
      DELETE: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const body = await req.json()
            const { id } = body

            if (!id) {
              return jsonResponse(
                {
                  status: 400,
                  message: 'Table ID is required',
                  error: true,
                },
                400,
              )
            }

            await axiosInstance.delete('/admin/tables', {
              headers: { Authorization: `Bearer ${accessToken}` },
              data: { id },
            })

            return jsonResponse(
              {
                status: 200,
                message: 'Table deleted successfully',
                deleted_table_id: id,
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
            const errorResponse = handleApiError(error, 'deleting table')
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
