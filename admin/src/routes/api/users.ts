import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/users')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            const url = new URL(request.url)

            // Forward all query parameters
            const endpoint = `/admin/users${url.search}`

            const response = await axiosInstance.get(endpoint, {
              headers: { Authorization: `Bearer ${accessToken}` },
            })

            return jsonResponse(response.data, 200, authHeaders)
          } catch (error) {
            const errorResponse = handleApiError(error, 'Error fetching users')
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
      PATCH: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            const body = await request.json()

            const response = await axiosInstance.patch('/admin/users', body, {
              headers: { Authorization: `Bearer ${accessToken}` },
            })

            return jsonResponse(response.data, 200, authHeaders)
          } catch (error) {
            const errorResponse = handleApiError(error, 'Error updating user')
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
      DELETE: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            const url = new URL(request.url)
            const uid = url.searchParams.get('uid')

            if (!uid) {
              return jsonResponse(
                { status: 400, message: 'UID is required' },
                400,
              )
            }

            const response = await axiosInstance.delete(`/admin/users/${uid}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            })

            return jsonResponse(response.data, 200, authHeaders)
          } catch (error) {
            const errorResponse = handleApiError(error, 'Error deleting user')
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
