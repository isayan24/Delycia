import { createFileRoute } from '@tanstack/react-router'
import axios from 'axios'

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8020/api/v1'

// Helper function to parse cookies
function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}
  return cookieHeader.split(';').reduce(
    (cookies, cookie) => {
      const [name, value] = cookie.trim().split('=')
      cookies[name] = value
      return cookies
    },
    {} as Record<string, string>,
  )
}

export const Route = createFileRoute('/api/auth/refresh')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Get refresh token from httpOnly cookie
          const cookieHeader = request.headers.get('cookie')
          const cookies = parseCookies(cookieHeader)
          const refreshToken = cookies['refresh_token']

          if (!refreshToken) {
            return new Response(
              JSON.stringify({
                statusCode: 401,
                message: 'No refresh token found',
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Call backend refresh endpoint
          const response = await axios.post(
            `${SERVER_URL}/users/auth/refresh`,
            null,
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
                Accept: 'application/json',
              },
            },
          )

          if (
            response.data &&
            response.data.access_token &&
            response.data.refresh_token
          ) {
            const { access_token, refresh_token } = response.data

            // Set new httpOnly cookies
            const isProduction = process.env.NODE_ENV === 'production'
            const cookieOptions = {
              httpOnly: true,
              secure: isProduction,
              sameSite: 'strict' as const,
              path: '/',
            }

            const headers = new Headers({
              'Content-Type': 'application/json',
            })

            // Set new access token cookie (7 days)
            headers.append(
              'Set-Cookie',
              `access_token=${access_token}; Max-Age=${7 * 24 * 60 * 60}; ${cookieOptions.httpOnly ? 'HttpOnly;' : ''} ${cookieOptions.secure ? 'Secure;' : ''} SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}`,
            )

            // Set new refresh token cookie (30 days)
            headers.append(
              'Set-Cookie',
              `refresh_token=${refresh_token}; Max-Age=${30 * 24 * 60 * 60}; ${cookieOptions.httpOnly ? 'HttpOnly;' : ''} ${cookieOptions.secure ? 'Secure;' : ''} SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}`,
            )

            return new Response(
              JSON.stringify({
                statusCode: 200,
                message: 'Token refreshed successfully',
              }),
              { status: 200, headers },
            )
          } else {
            return new Response(
              JSON.stringify({
                statusCode: 401,
                message: 'Token refresh failed',
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }
        } catch (error: any) {
          console.error('Token refresh error:', error)

          // Handle 401 from backend (invalid refresh token)
          if (error.response?.status === 401) {
            return new Response(
              JSON.stringify({
                statusCode: 401,
                message: 'Refresh token expired or invalid',
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Other errors
          return new Response(
            JSON.stringify({
              statusCode: 500,
              message: 'Token refresh failed',
              error: error.message,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
