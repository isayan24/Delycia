import { createFileRoute } from '@tanstack/react-router'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/ws-token')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (token, authHeaders) => {
          try {
            // Return the actual access token - backend validates this with ACCESS_SECRET
            // No need to create a new JWT, just pass through the existing token
            const response = jsonResponse(
              {
                token: token,
                expiresIn: 900, // 15 minutes (typical access token expiry)
              },
              200,
              authHeaders,
            )

            // Add Cache-Control header to prevent token caching
            response.headers.set('Cache-Control', 'no-store')

            return response
          } catch (error) {
            console.error('Error getting WS token:', error)
            return jsonResponse(
              {
                error: 'Token retrieval failed',
                message: error instanceof Error ? error.message : 'Unknown error',
              },
              500,
              authHeaders,
            )
          }
        })
      },
    },
  },
})
