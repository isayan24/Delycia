import { createFileRoute } from '@tanstack/react-router'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'
import axiosInstance from '@/lib/axios'
import { handleApiError } from '@/helpers/handleApiError'

export const Route = createFileRoute('/api/addons')({
  server: {
    handlers: {
      // GET /api/addons - Fetch addons with optional filters
      GET: async ({ request }) => {
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

          // Extract query parameters
          const url = new URL(request.url)
          const rid = url.searchParams.get('rid')
          const is_active = url.searchParams.get('is_active')
          const id = url.searchParams.get('id')
          const addon_id = url.searchParams.get('addon_id')
          const inventory_id = url.searchParams.get('inventory_id')

          // Build backend endpoint with query params
          const queryParams = new URLSearchParams()
          if (rid) queryParams.append('rid', rid)
          if (is_active) queryParams.append('is_active', is_active)
          if (id) queryParams.append('id', id)
          if (addon_id) queryParams.append('addon_id', addon_id)
          if (inventory_id) queryParams.append('inventory_id', inventory_id)

          const queryString = queryParams.toString()
          let endpoint = '/admin/addons'

          // If inventory_id is present, use the inventory-specific endpoint
          if (inventory_id) {
            endpoint = `/admin/addons/inventory`
          }

          endpoint = queryString ? `${endpoint}?${queryString}` : endpoint

          // Call backend with token from cookie
          const response = await axiosInstance.get(endpoint, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const errorResponse = handleApiError(error, 'Error fetching addons')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },

      // POST /api/addons - Create addon or link/unlink operations
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
          const action = url.searchParams.get('action') // link-item, unlink-item, link-order

          // Determine endpoint based on action
          let endpoint = '/admin/addons'
          if (action === 'link-item') {
            endpoint = '/admin/addons/link-item'
          } else if (action === 'unlink-item') {
            endpoint = '/admin/addons/unlink-item'
          } else if (action === 'link-order') {
            endpoint = '/admin/addons/link-order'
          }

          const response = await axiosInstance.post(endpoint, body, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const errorResponse = handleApiError(error, 'Error creating addon')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },

      // PATCH /api/addons - Update addon
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

          const response = await axiosInstance.patch('/admin/addons', body, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const errorResponse = handleApiError(error, 'Error updating addon')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },

      // DELETE /api/addons - Delete addon
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

          await axiosInstance.delete('/admin/addons', {
            data: body,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          return new Response(
            JSON.stringify({ message: 'Addon deleted successfully' }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        } catch (error) {
          const errorResponse = handleApiError(error, 'Error deleting addon')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
