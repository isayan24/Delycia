import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/auth/create-admin')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return withAuth(request, async (token, authHeaders, req) => {
          try {
            const body = await req.json()

            // Make request to backend with token from cookie
            const response = await axiosInstance.post(
              '/admin/auth/create-admin',
              body,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )

            return jsonResponse(response.data, 200, authHeaders)
          } catch (error:any) {
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error // Let withAuth handle auth errors
            }
            
            const errorResponse = handleApiError(
              error,
              'Error creating staff member',
            )
            return jsonResponse(
              errorResponse,
              errorResponse.status || 500,
              authHeaders,
            )
          }
        })
      },
    },
  },
})
