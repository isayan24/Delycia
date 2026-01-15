import { createFileRoute } from '@tanstack/react-router'
import axios from 'axios'
import qs from 'qs'

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8020/api/v1'

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { phone_number, password } = await request.json()

          if (!phone_number || !password) {
            return new Response(
              JSON.stringify({
                statusCode: 400,
                message: 'Phone number and password are required',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Call backend admin login endpoint
          const response = await axios.post(
            `${SERVER_URL}/admin/auth/login`,
            qs.stringify({ phone_number, password }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
              },
            },
          )

          const backendData = response.data

          console.log(backendData, 'backendData')

          if (backendData?.statusCode === 200 && backendData?.data) {
            const backendUser = backendData.data

            // Extract tokens
            const access_token = backendUser.access_token
            const refresh_token = backendUser.refresh_token

            // Extract user fields from backend response
            // Use backend's phone_number if available, otherwise fall back to request
            const userData = {
              _id: backendUser.uid || backendUser._id,
              id: backendUser.id,
              phone_number: backendUser.phone_number || phone_number,
              role: backendUser.role,
              restaurant_rids: backendUser.restaurant_rids || [],
              selected_rid:
                backendUser.selected_rid ||
                (backendUser.restaurant_rids &&
                backendUser.restaurant_rids.length > 0
                  ? backendUser.restaurant_rids[0]
                  : null),
            }

            console.log('Extracted user data:', userData)

            // Set httpOnly cookies for tokens
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

            // Set access token cookie (7 days)
            headers.append(
              'Set-Cookie',
              `access_token=${access_token}; Max-Age=${7 * 24 * 60 * 60}; ${cookieOptions.httpOnly ? 'HttpOnly;' : ''} ${cookieOptions.secure ? 'Secure;' : ''} SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}`,
            )

            // Set refresh token cookie (30 days)
            headers.append(
              'Set-Cookie',
              `refresh_token=${refresh_token}; Max-Age=${30 * 24 * 60 * 60}; ${cookieOptions.httpOnly ? 'HttpOnly;' : ''} ${cookieOptions.secure ? 'Secure;' : ''} SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}`,
            )

            // Return user data without tokens
            return new Response(
              JSON.stringify({
                statusCode: 200,
                message: 'Login successful',
                data: {
                  user: userData,
                },
              }),
              { status: 200, headers },
            )
          } else {
            return new Response(
              JSON.stringify({
                statusCode: backendData?.statusCode || 401,
                message: backendData?.message || 'Login failed',
              }),
              {
                status: backendData?.statusCode || 401,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }
        } catch (error: any) {
          console.error('Login error:', error)

          // Handle backend errors
          if (error.response) {
            return new Response(
              JSON.stringify({
                statusCode: error.response.status,
                message:
                  error.response.data?.message || 'Authentication failed',
              }),
              {
                status: error.response.status,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }

          // Network or other errors
          return new Response(
            JSON.stringify({
              statusCode: 500,
              message: 'Internal server error',
              error: error.message,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
