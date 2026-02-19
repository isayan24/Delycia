import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'
import { handleApiError } from '@/helpers/handleApiError'

export const Route = createFileRoute('/api/admin/update')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const body = await req.json()
            const { uid, username, name, password, profile_pic, phone_number } =
              body

            // Pass Authorization header with token from cookie
            const headers = {
              Authorization: `Bearer ${accessToken}`,
            }

            if (password) {
              await axiosInstance.patch(`/users`, { uid, password }, { headers })
            }

            if (username || name) {
              await axiosInstance.patch(
                `/users`,
                {
                  uid,
                  username,
                  name,
                  phone_number,
                },
                { headers },
              )
            }

            if (profile_pic) {
              await axiosInstance.patch(
                `/users`,
                { uid, profile_pic },
                { headers },
              )
            }

            return jsonResponse(
              { message: 'User updated successfully' },
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
            const errorResponse = handleApiError(error, 'updating user')
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
