import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/users/search')({
  server: {
    handlers: {
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
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }

          const url = new URL(request.url)
          const name = url.searchParams.get('name')

          if (!name || name.trim().length < 2) {
            return new Response(
              JSON.stringify({
                status: 400,
                message: 'Search term must be at least 2 characters',
                error: true,
                users: [],
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }

          // Call backend API with authentication
          const response = await axiosInstance.get('/users/search', {
            params: { name },
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          })
        } catch (error) {
          const errorResponse = handleApiError(error, 'Failed to search users')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
