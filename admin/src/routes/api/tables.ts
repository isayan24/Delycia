import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

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
        try {
          const url = new URL(request.url)
          const rid = url.searchParams.get('rid')
          const type = url.searchParams.get('type') || 'tables'

          if (!rid) {
            return new Response(
              JSON.stringify({
                status: 400,
                message: 'Restaurant ID (rid) is required',
                error: true,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Tables endpoint doesn't require auth (public data)
          const endpoint = type === 'zones' ? '/tables/zones' : '/tables'
          const response = await axiosInstance.get(endpoint, {
            params: { rid },
          })

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const errorResponse = handleApiError(error, 'fetching tables')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },

      /**
       * POST /api/tables - Create a new table
       * Body: { rid, table_number, capacity, zone }
       */
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
          const { rid, table_number, capacity, zone } = body

          if (!rid || !table_number || !capacity || !zone) {
            return new Response(
              JSON.stringify({
                status: 400,
                message:
                  'Missing required fields: rid, table_number, capacity, zone',
                error: true,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          await axiosInstance.post(
            '/admin/tables',
            { rid, table_number, capacity, zone },
            { headers: { Authorization: `Bearer ${accessToken}` } },
          )

          return new Response(
            JSON.stringify({
              status: 201,
              message: 'Table created successfully',
              success: true,
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          const errorResponse = handleApiError(error, 'creating table')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },

      /**
       * PATCH /api/tables - Update a table
       * Body: { id, status, capacity?, zone? }
       */
      PATCH: async ({ request }) => {
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
          const { id, status, capacity, zone } = body

          if (!id) {
            return new Response(
              JSON.stringify({
                status: 400,
                message: 'Table ID is required',
                error: true,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          await axiosInstance.patch(
            '/admin/tables',
            { id, status, capacity, zone },
            { headers: { Authorization: `Bearer ${accessToken}` } },
          )

          return new Response(
            JSON.stringify({
              status: 200,
              message: 'Table updated successfully',
              success: true,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          const errorResponse = handleApiError(error, 'updating table')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },

      /**
       * DELETE /api/tables - Delete a table
       * Body: { id }
       */
      DELETE: async ({ request }) => {
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
          const { id } = body

          if (!id) {
            return new Response(
              JSON.stringify({
                status: 400,
                message: 'Table ID is required',
                error: true,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          await axiosInstance.delete('/admin/tables', {
            headers: { Authorization: `Bearer ${accessToken}` },
            data: { id },
          })

          return new Response(
            JSON.stringify({
              status: 200,
              message: 'Table deleted successfully',
              deleted_table_id: id,
              success: true,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          const errorResponse = handleApiError(error, 'deleting table')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
