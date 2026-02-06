import axiosInstance from '@/lib/axios'
import { createFileRoute } from '@tanstack/react-router'
import qs from 'qs'

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { phone_number, username, password } = await request.json()

          if (!password) {
            return new Response(
              JSON.stringify({
                statusCode: 400,
                message: 'Password is required',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          if (!phone_number && !username) {
            return new Response(
              JSON.stringify({
                statusCode: 400,
                message: 'Phone number or Username is required',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Call backend admin login endpoint
          const payload = {
            password,
            ...(phone_number ? { phone_number } : { username }),
          }

          const response = await axiosInstance.post(
            `/admin/auth/login`,
            qs.stringify(payload),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
              },
            },
          )

          const backendData = response.data

          if (backendData?.statusCode === 200 && backendData?.data) {
            const backendUser = backendData.data

            // Extract tokens
            const access_token = backendUser.access_token
            const refresh_token = backendUser.refresh_token

            // Extract user fields from backend response
            // Include all user details for localStorage storage
            const userData = {
              _id: backendUser.uid || backendUser._id,
              id: backendUser.id,
              name: backendUser.name || null,
              username: backendUser.username || null,
              email: backendUser.email || null,
              phone_number: backendUser.phone_number || phone_number,
              profile_pic: backendUser.profile_pic || null,
              role: backendUser.role,
              restaurant_rids: backendUser.restaurant_rids || [],
              selected_rid:
                backendUser.selected_rid ||
                (backendUser.restaurant_rids &&
                backendUser.restaurant_rids.length > 0
                  ? backendUser.restaurant_rids[0]
                  : null),
            }

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
              `admin_access_token=${access_token}; Max-Age=${7 * 24 * 60 * 60}; ${cookieOptions.httpOnly ? 'HttpOnly;' : ''} ${cookieOptions.secure ? 'Secure;' : ''} SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}`,
            )

            // Set refresh token cookie (30 days)
            headers.append(
              'Set-Cookie',
              `admin_refresh_token=${refresh_token}; Max-Age=${30 * 24 * 60 * 60}; ${cookieOptions.httpOnly ? 'HttpOnly;' : ''} ${cookieOptions.secure ? 'Secure;' : ''} SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}`,
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
