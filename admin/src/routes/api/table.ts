import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/table')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { rid, table_number, capacity, zone } = body

          const accessToken = getAccessTokenFromCookie(request)

          if (!rid || !table_number || !capacity || !zone) {
            return new Response(JSON.stringify({ error: 'Invalid request' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          if (!accessToken) {
            return new Response(
              JSON.stringify({ error: 'Not authenticated' }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }

          await axiosInstance.post(
            `/admin/tables`,
            {
              rid,
              table_number,
              capacity,
              zone,
            },
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          )

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
      PATCH: async ({ request }) => {
        try {
          const body = await request.json()
          const { id, status, capacity, zone } = body

          const accessToken = getAccessTokenFromCookie(request)

          if (!accessToken) {
            return new Response(
              JSON.stringify({ error: 'Not authenticated' }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }

          if (!id || !status) {
            return new Response(
              JSON.stringify({
                error: 'Invalid request - id and status required',
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }

          const payload = { id, status, capacity, zone }

          await axiosInstance.patch(`/admin/tables`, payload, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })

          return new Response(
            JSON.stringify({ message: 'Table updated successfully' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error: any) {
          console.error('Error updating table:', error)
          const message =
            error.response?.data?.message || 'Failed to update table'
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
      DELETE: async ({ request }) => {
        try {
          const body = await request.json()
          const { id } = body

          const accessToken = getAccessTokenFromCookie(request)

          if (!accessToken) {
            return new Response(
              JSON.stringify({ error: 'Access token is required' }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }

          if (!id) {
            return new Response(
              JSON.stringify({ error: 'Table ID is required' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }

          await axiosInstance.delete(`/admin/tables`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            data: { id },
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
          const status = error.response?.status || 500
          const message =
            error.response?.data?.message || 'Failed to delete table'
          return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
