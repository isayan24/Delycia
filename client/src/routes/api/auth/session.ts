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
            // Decode token to get user ID
            const decoded: any = jwt.decode(accessToken)
            if (!decoded || !decoded.id) {
              return jsonResponse(
                {
                  statusCode: 401,
                  message: 'Invalid token',
                  isAuthenticated: false,
                },
                401,
                authHeaders,
              )
            }

            // Fetch user data from backend using the access token
            // withAuth() already handles token refresh, so we just fetch the data
            const userResponse = await axiosInstance.get(
              `/users?id=${decoded.id}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: 'application/json',
                },
              },
            )

            // Support both response structures
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

            // User not found
            return jsonResponse(
              {
                statusCode: 401,
                message: 'User not found',
                isAuthenticated: false,
              },
              401,
              authHeaders,
            )
          } catch (error: any) {
            // If it's a token error, withAuth will handle it
            if (isTokenExpiredError(error)) {
              throw error
            }

            // Other errors
            console.error('[session] Error:', error.message)
            return jsonResponse(
              {
                statusCode: 500,
                message: 'Session validation failed',
                isAuthenticated: false,
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
