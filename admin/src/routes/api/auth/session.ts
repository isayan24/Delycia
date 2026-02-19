import { createFileRoute } from '@tanstack/react-router'
import jwt from 'jsonwebtoken'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

/**
 * Session validation endpoint.
 *
 * This endpoint uses withAuth() which handles all token refresh logic automatically.
 * We simply fetch and return user data - withAuth takes care of:
 * - Extracting access token from cookies
 * - Refreshing tokens if expired (via RefreshCoordinator)
 * - Retrying the request with new tokens
 * - Setting updated cookies in the response
 */
export const Route = createFileRoute('/api/auth/session')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
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

            // Fetch user data from backend
            const userResponse = await axiosInstance.get(
              `/admin/users?id=${decoded.id}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: 'application/json',
                },
              },
            )

            // Validate response
            if (
              userResponse.data?.statusCode === 200 &&
              userResponse.data?.message?.users &&
              userResponse.data.message.users.length > 0
            ) {
              const userData = userResponse.data.message.users[0]

              return jsonResponse(
                {
                  statusCode: 200,
                  message: 'Session valid',
                  isAuthenticated: true,
                  data: {
                    user: {
                      _id: userData.uid,
                      id: userData.id,
                      username: userData.username,
                      name: userData.name,
                      email: userData.email,
                      phone_number: userData.phone_number,
                      profile_pic: userData.profile_pic,
                      role: userData.role,
                      restaurant_rids: userData.restaurant_rids || [],
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
            // Handle backend errors
            console.error('[session] Error fetching user data:', error.message)
            
            // Log the full error details for debugging
            if (error.response) {
              console.error('[session] Response status:', error.response.status)
              console.error('[session] Response data:', error.response.data)
              console.error('[session] Token used (first 20 chars):', accessToken.substring(0, 20) + '...')
            }

            // If it's an auth error, withAuth will handle it
            // For other errors, return a generic error response
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error // Let withAuth handle auth errors
            }

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
