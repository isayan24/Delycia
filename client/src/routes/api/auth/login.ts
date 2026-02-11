import axiosInstance from '@/lib/axios'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { country_code, phone_number } = await request.json()

          if (!phone_number) {
            return new Response(
              JSON.stringify({
                statusCode: 400,
                message: 'Phone number is required',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Call backend client login endpoint
          const payload = {
            country_code: country_code || '+91',
            phone_number,
          }
          
          const response = await axiosInstance.post(
            `/users/auth/handleAuth`,
            payload,
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            },
          )

          const backendData = response.data

          if (backendData?.statusCode === 200 && backendData?.data) {
            const backendUser = backendData.data
            const access_token = backendUser.access_token
            const refresh_token = backendUser.refresh_token

            // Fetch complete user profile data using the access token
            let completeUserData = {
              _id: backendUser.uid || backendUser._id,
              id: backendUser.id,
              country_code: backendUser.country_code,
              phone_number: backendUser.phone_number,
              role: backendUser.role || 0,
              name: backendUser.name,
              username: backendUser.username,
              email: backendUser.email,
              profile_pic: backendUser.profile_pic,
            }

            // Try to fetch complete user data from /users endpoint
            try {
              const userResponse = await axiosInstance.get(
                `/users?id=${backendUser.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${access_token}`,
                    Accept: 'application/json',
                  },
                },
              )

              if (userResponse.data?.user) {
                const userData = userResponse.data.user
                completeUserData = {
                  _id: userData.uid || userData._id,
                  id: userData.id,
                  country_code: userData.country_code,
                  phone_number: userData.phone_number,
                  role: userData.role || 0,
                  name: userData.name,
                  username: userData.username,
                  email: userData.email,
                  profile_pic: userData.profile_pic,
                }
              }
            } catch (userFetchError) {
              console.warn('Could not fetch complete user data, using basic data:', userFetchError)
              // Continue with basic user data from login response
            }

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

            if (access_token) {
              headers.append(
                'Set-Cookie',
                `access_token=${access_token}; Max-Age=${7 * 24 * 60 * 60}; ${cookieOptions.httpOnly ? 'HttpOnly;' : ''} ${cookieOptions.secure ? 'Secure;' : ''} SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}`,
              )
            }

            if (refresh_token) {
              headers.append(
                'Set-Cookie',
                `refresh_token=${refresh_token}; Max-Age=${30 * 24 * 60 * 60}; ${cookieOptions.httpOnly ? 'HttpOnly;' : ''} ${cookieOptions.secure ? 'Secure;' : ''} SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}`,
              )
            }

            return new Response(
              JSON.stringify({
                statusCode: 200,
                message: 'Login successful',
                data: {
                  user: completeUserData,
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
