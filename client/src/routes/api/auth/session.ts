import { createFileRoute } from '@tanstack/react-router'
import jwt from 'jsonwebtoken'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/auth/session')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          // Get access token from httpOnly cookie
          // Get access token from httpOnly cookie
          const accessToken = getAccessTokenFromCookie(request)

          if (!accessToken) {
            return new Response(
              JSON.stringify({
                statusCode: 401,
                message: 'No session found',
                isAuthenticated: false,
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Validate JWT structure
          let decoded: any
          try {
            decoded = jwt.decode(accessToken)
            if (!decoded || !decoded.exp) {
              throw new Error('Invalid token structure')
            }

            // Check if token is expired
            const currentTime = Math.floor(Date.now() / 1000)
            if (decoded.exp < currentTime) {
              return new Response(
                JSON.stringify({
                  statusCode: 401,
                  message: 'Session expired',
                  isAuthenticated: false,
                }),
                {
                  status: 401,
                  headers: { 'Content-Type': 'application/json' },
                },
              )
            }
          } catch (error) {
            return new Response(
              JSON.stringify({
                statusCode: 401,
                message: 'Invalid session',
                isAuthenticated: false,
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Fetch user data from backend using the access token
          try {
            const userResponse = await axiosInstance.get(
              `/users?id=${decoded.id}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: 'application/json',
                },
              },
            )

            // Based on user feedback: data: { status: true, user: { ... } }
            // Support both potential structures just in case
            const responseData = userResponse.data
            const userData = responseData?.user || responseData?.data?.user

            if (userData) {
              return new Response(
                JSON.stringify({
                  statusCode: 200,
                  message: 'Session valid',
                  isAuthenticated: true,
                  data: {
                    user: {
                      _id: userData.uid || userData._id,
                      id: userData.id,
                      name: userData.name,
                      username: userData.username,
                      email: userData.email,
                      country_code: userData.country_code,
                      phone_number: userData.phone_number,
                      profile_pic: userData.profile_pic,
                      role: userData.role,
                    },
                  },
                }),
                {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                },
              )
            }

            // If we received a 200 OK but no user data found in expected format
            throw new Error('User data not found in response')
          } catch (userError: any) {
            console.error('Failed to fetch user data:', userError.message)
            // User requested to remove fallback to limited data.
            // If backend fetch fails, we treat it as a failed session validation or server error.
            return new Response(
              JSON.stringify({
                statusCode: 500,
                message: 'Failed to fetch user profile',
                isAuthenticated: false,
                error: userError.message,
              }),
              { status: 500, headers: { 'Content-Type': 'application/json' } },
            )
          }
        } catch (error: any) {
          console.error('Session validation error:', error)
          return new Response(
            JSON.stringify({
              statusCode: 500,
              message: 'Session validation failed',
              isAuthenticated: false,
              error: error.message,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
