import { createFileRoute } from '@tanstack/react-router'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/ws-token')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          // Get access token from httpOnly cookie
          const accessToken = getAccessTokenFromCookie(request)

          if (!accessToken) {
            return new Response(
              JSON.stringify({
                error: 'Not authenticated',
                message: 'No access token found',
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Return the actual access token - backend validates this with ACCESS_SECRET
          // No need to create a new JWT, just pass through the existing token
          return new Response(
            JSON.stringify({
              token: accessToken,
              expiresIn: 900, // 15 minutes (typical access token expiry)
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store', // Don't cache tokens
              },
            },
          )
        } catch (error) {
          console.error('Error getting WS token:', error)
          return new Response(
            JSON.stringify({
              error: 'Token retrieval failed',
              message: error instanceof Error ? error.message : 'Unknown error',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
