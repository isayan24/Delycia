import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'
import { handleApiError } from '@/helpers/handleApiError'

export const Route = createFileRoute('/api/guest-customer')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            // Call backend to create guest customer
            const response = await axiosInstance.post(
              '/admin/auth/guest-customer',
              {},
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              },
            )
            return jsonResponse(
              {
                success: true,
                data: response.data,
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
              throw error
            }

            // For other errors, return a generic error response
            const errorResponse = handleApiError(
              error,
              'Failed to create guest customer',
            )
            return jsonResponse(
              {
                error: 'Failed to create guest customer',
                message:
                  error.response?.data?.message ||
                  error.message ||
                  'Unknown error',
              },
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
    },
  },
})
