import { createFileRoute } from '@tanstack/react-router'
import jwt from 'jsonwebtoken'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse, isTokenExpiredError } from '@/lib/withAuth'

export const Route = createFileRoute('/api/auth/session')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
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
                return jsonResponse(
                  {
                    statusCode: 401,
                    message: 'Session expired',
                    isAuthenticated: false,
                  },
                  401,
                  authHeaders,
                )
              }
            } catch (error) {
              return jsonResponse(
                {
                  statusCode: 401,
                  message: 'Invalid session',
                  isAuthenticated: false,
                },
                401,
                authHeaders,
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
                return jsonResponse(
                  {
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
                  },
                  200,
                  authHeaders,
                )
              }

              // If we received a 200 OK but no user data found in expected format
              throw new Error('User data not found in response')
            } catch (userError: any) {
              if (isTokenExpiredError(userError)) throw userError
              console.error('Failed to fetch user data:', userError.message)
              // User requested to remove fallback to limited data.
              // If backend fetch fails, we treat it as a failed session validation or server error.
              return jsonResponse(
                {
                  statusCode: 500,
                  message: 'Failed to fetch user profile',
                  isAuthenticated: false,
                  error: userError.message,
                },
                500,
                authHeaders,
              )
            }
          } catch (error: any) {
            console.error('Session validation error:', error)
            return jsonResponse(
              {
                statusCode: 500,
                message: 'Session validation failed',
                isAuthenticated: false,
                error: error.message,
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
