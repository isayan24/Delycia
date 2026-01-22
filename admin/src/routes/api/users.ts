import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/users')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const accessToken = getAccessTokenFromCookie(request)
          if (!accessToken) {
            return new Response(
              JSON.stringify({ status: 401, message: 'Not authenticated' }),
              { status: 401 },
            )
          }

          const url = new URL(request.url)

          // Forward all query parameters
          const endpoint = `/admin/users${url.search}`
          console.log(endpoint, 'endpoint \n\n\n\n\n\n')

          const response = await axiosInstance.get(endpoint, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })

          return new Response(JSON.stringify(response.data), { status: 200 })
        } catch (error) {
          const errorResponse = handleApiError(error, 'Error fetching users')
          return new Response(JSON.stringify(errorResponse), { status: 500 })
        }
      },
      PATCH: async ({ request }) => {
        try {
          const accessToken = getAccessTokenFromCookie(request)
          if (!accessToken) {
            return new Response(
              JSON.stringify({ status: 401, message: 'Not authenticated' }),
              { status: 401 },
            )
          }

          const body = await request.json()

          const response = await axiosInstance.patch('/admin/users', body, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })

          return new Response(JSON.stringify(response.data), { status: 200 })
        } catch (error) {
          const errorResponse = handleApiError(error, 'Error updating user')
          return new Response(JSON.stringify(errorResponse), { status: 500 })
        }
      },
    },
  },
})
