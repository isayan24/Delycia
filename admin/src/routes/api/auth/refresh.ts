import axiosInstance from '@/lib/axios'
import { createFileRoute } from '@tanstack/react-router'
import { parseCookies } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/auth/refresh')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Get refresh token from httpOnly cookie
          const cookieHeader = request.headers.get('cookie')
          const cookies = parseCookies(cookieHeader)
          const refreshToken = cookies['admin_refresh_token']

          if (!refreshToken) {
            return new Response(
              JSON.stringify({
                statusCode: 401,
                message: 'No refresh token found',
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Call backend refresh endpoint with Bearer token
          const response = await axiosInstance.post(
            '/users/auth/refresh',
            null,
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
                Accept: 'application/json',
              },
            },
          )

          // Backend returns: { status: true, refresh_token, access_token }
          if (response.data?.access_token && response.data?.refresh_token) {
            const { access_token, refresh_token } = response.data

            console.log('*** Token Refreshed ***')

            // Set new httpOnly cookies
            const isProduction = process.env.NODE_ENV === 'production'
            const secure = isProduction ? 'Secure;' : ''

            const headers = new Headers({
              'Content-Type': 'application/json',
            })

            // Set new access token cookie (7 days)
            headers.append(
              'Set-Cookie',
              `admin_access_token=${access_token}; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; ${secure} SameSite=strict; Path=/`,
            )

            // Set new refresh token cookie (30 days)
            headers.append(
              'Set-Cookie',
              `admin_refresh_token=${refresh_token}; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; ${secure} SameSite=strict; Path=/`,
            )

            return new Response(
              JSON.stringify({
                statusCode: 200,
                message: 'Token refreshed successfully',
              }),
              { status: 200, headers },
            )
          } else {
            console.error(
              '[refresh] Backend returned unexpected data:',
              response.data,
            )
            return new Response(
              JSON.stringify({
                statusCode: 401,
                message: 'Token refresh failed',
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }
        } catch (error: any) {
          console.error(
            '[refresh] Token refresh error:',
            error?.response?.data || error.message,
          )

          // Handle 401 from backend (invalid refresh token)
          const status = error.response?.status === 401 ? 401 : 500
          return new Response(
            JSON.stringify({
              statusCode: status,
              message:
                status === 401
                  ? 'Refresh token expired or invalid'
                  : 'Token refresh failed',
            }),
            { status, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
