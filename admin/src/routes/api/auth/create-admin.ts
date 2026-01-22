import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/auth/create-admin')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Get token from httpOnly cookie
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

          // Make request to backend with token from cookie
          const response = await axiosInstance.post(
            '/admin/auth/create-admin',
            body,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          )

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const errorResponse = handleApiError(
            error,
            'Error creating staff member',
          )
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
