import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async () => {
        try {
          const headers = new Headers({
            'Content-Type': 'application/json',
          })

          // Clear access token cookie
          headers.append(
            'Set-Cookie',
            'admin_access_token=; Max-Age=0; HttpOnly; SameSite=strict; Path=/',
          )

          // Clear refresh token cookie
          headers.append(
            'Set-Cookie',
            'admin_refresh_token=; Max-Age=0; HttpOnly; SameSite=strict; Path=/',
          )

          return new Response(
            JSON.stringify({
              statusCode: 200,
              message: 'Logout successful',
            }),
            { status: 200, headers },
          )
        } catch (error: any) {
          console.error('Logout error:', error)
          return new Response(
            JSON.stringify({
              statusCode: 500,
              message: 'Logout failed',
              error: error.message,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
