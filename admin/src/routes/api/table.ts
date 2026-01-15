import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/table')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { rid, table_number, capacity, zone, accessToken } = body

          if (!rid || !table_number || !capacity || !zone) {
            return new Response(JSON.stringify({ error: 'Invalid request' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          const access_token = accessToken
          const payload = {
            rid,
            table_number,
            capacity,
            zone,
          }

          await axiosInstance.post(`/admin/tables`, payload, {
            headers: { Authorization: `Bearer ${access_token}` },
          })

          return new Response(
            JSON.stringify({ message: 'Table created successfully' }),
            { status: 201, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          return new Response(
            JSON.stringify({ error: 'Failed to create table' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
      DELETE: async ({ request }) => {
        try {
          const body = await request.json()
          const { id, accessToken } = body

          if (!id) {
            return new Response(
              JSON.stringify({ error: 'Table ID is required' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          if (!accessToken) {
            return new Response(
              JSON.stringify({ error: 'Access token is required' }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Delete table via external API - only needs table id and access token
          await axiosInstance.delete(`/admin/tables`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            data: { id }, // Send id in request body
          })

          return new Response(
            JSON.stringify({
              message: 'Table deleted successfully',
              deleted_table_id: id,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error: any) {
          console.error('Error deleting table:', error)

          // Handle specific error responses from the external API
          if (error.response) {
            const status = error.response.status
            const message =
              error.response.data?.message || 'Failed to delete table'

            return new Response(JSON.stringify({ error: message }), {
              status,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
