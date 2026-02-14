import { createFileRoute } from '@tanstack/react-router'
import jwt from 'jsonwebtoken'
import axiosInstance from '@/lib/axios'
import { parseCookies } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/auth/session')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          // Get tokens from httpOnly cookies
          const cookieHeader = request.headers.get('cookie')
          const cookies = parseCookies(cookieHeader)
          const accessToken = cookies['admin_access_token']
          const refreshToken = cookies['admin_refresh_token']

          // ─── Case 1: No access token at all ───
          if (!accessToken) {
            // Try to refresh if we have a refresh token
            if (refreshToken) {
              return await attemptRefreshAndFetchUser(refreshToken)
            }

            return jsonResponse(
              {
                statusCode: 401,
                message: 'No session found',
                isAuthenticated: false,
              },
              401,
            )
          }

          // ─── Case 2: Access token exists — check if expired ───
          let decoded: any
          try {
            decoded = jwt.decode(accessToken)
            if (!decoded || !decoded.exp) {
              throw new Error('Invalid token structure')
            }

            const currentTime = Math.floor(Date.now() / 1000)
            if (decoded.exp < currentTime) {
              // Token is expired — attempt refresh before giving up
              if (refreshToken) {
                return await attemptRefreshAndFetchUser(refreshToken)
              }

              return jsonResponse(
                {
                  statusCode: 401,
                  message: 'Session expired',
                  isAuthenticated: false,
                },
                401,
              )
            }
          } catch {
            // Invalid token structure — try refresh
            if (refreshToken) {
              return await attemptRefreshAndFetchUser(refreshToken)
            }

            return jsonResponse(
              {
                statusCode: 401,
                message: 'Invalid session',
                isAuthenticated: false,
              },
              401,
            )
          }

          // ─── Case 3: Valid access token — fetch user data ───
          return await fetchUserData(accessToken, decoded)
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
          )
        }
      },
    },
  },
})

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

/**
 * Attempt to refresh tokens using the refresh token, then fetch user data
 * with the new access token. Returns a Response with Set-Cookie headers
 * to update the browser's tokens.
 */
async function attemptRefreshAndFetchUser(
  refreshToken: string,
): Promise<Response> {
  try {
    // Call backend refresh endpoint directly
    const refreshResponse = await axiosInstance.post(
      '/users/auth/refresh',
      null,
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          Accept: 'application/json',
        },
      },
    )

    if (
      !refreshResponse.data?.access_token ||
      !refreshResponse.data?.refresh_token
    ) {
      console.error(
        '[session] Refresh returned unexpected data:',
        refreshResponse.data,
      )
      return jsonResponse(
        {
          statusCode: 401,
          message: 'Session expired. Please log in again.',
          isAuthenticated: false,
        },
        401,
      )
    }

    const { access_token, refresh_token } = refreshResponse.data
    console.log('[session] Token auto-refreshed successfully')

    // Decode the new access token to get user ID
    const decoded: any = jwt.decode(access_token)
    if (!decoded) {
      return jsonResponse(
        {
          statusCode: 401,
          message: 'Invalid refreshed token',
          isAuthenticated: false,
        },
        401,
      )
    }

    // Fetch user data with the new access token
    const userResponse = await fetchUserResponse(access_token, decoded)

    // Build Set-Cookie headers for the new tokens
    const isProduction = process.env.NODE_ENV === 'production'
    const secure = isProduction ? 'Secure;' : ''
    const setCookieHeaders = [
      `admin_access_token=${access_token}; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; ${secure} SameSite=strict; Path=/`,
      `admin_refresh_token=${refresh_token}; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; ${secure} SameSite=strict; Path=/`,
    ]

    // Clone the user response but add Set-Cookie headers
    const responseBody = await userResponse.json()
    const headers = new Headers({ 'Content-Type': 'application/json' })
    for (const cookie of setCookieHeaders) {
      headers.append('Set-Cookie', cookie)
    }

    return new Response(JSON.stringify(responseBody), {
      status: userResponse.status,
      headers,
    })
  } catch (error: any) {
    console.error(
      '[session] Auto-refresh failed:',
      error?.response?.data || error.message,
    )
    return jsonResponse(
      {
        statusCode: 401,
        message: 'Session expired. Please log in again.',
        isAuthenticated: false,
      },
      401,
    )
  }
}

/**
 * Fetch user data from backend and return a properly formatted Response
 */
async function fetchUserData(
  accessToken: string,
  decoded: any,
): Promise<Response> {
  try {
    return await fetchUserResponse(accessToken, decoded)
  } catch (userError: any) {
    // If token is invalid/expired on backend (race condition), return 401
    if (
      userError.response?.status === 401 ||
      userError.response?.status === 403
    ) {
      return jsonResponse(
        {
          statusCode: 401,
          message: 'Session invalid or expired',
          isAuthenticated: false,
        },
        401,
      )
    }

    // For other errors (e.g. network), return basic decoded data
    return jsonResponse(
      {
        statusCode: 200,
        message: 'Session valid (limited data)',
        isAuthenticated: true,
        data: {
          user: {
            _id: decoded.uid,
            id: decoded.id,
            phone_number: null,
            role: null,
            restaurant_rids: [],
            selected_rid: null,
          },
        },
      },
      200,
    )
  }
}

/**
 * Internal: Make the backend API call to fetch user data
 */
async function fetchUserResponse(
  accessToken: string,
  decoded: any,
): Promise<Response> {
  const userResponse = await axiosInstance.get(
    `/admin/users?id=${decoded.id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    },
  )

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
    )
  }

  // Fallback — user not found
  return jsonResponse(
    {
      statusCode: 401,
      message: 'User not found',
      isAuthenticated: false,
    },
    401,
  )
}

/**
 * Helper to create a JSON Response
 */
function jsonResponse(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
