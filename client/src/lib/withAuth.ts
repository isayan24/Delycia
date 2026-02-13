import axiosInstance from './axios'
import { parseCookies, getAccessTokenFromCookie } from './server-cookies'

/**
 * Server-side (BFF) auth helper that handles token refresh transparently.
 *
 * Usage in any BFF route handler:
 * ```ts
 * return withAuth(request, async (token, headers) => {
 *   const res = await axiosInstance.get('/users', {
 *     headers: { Authorization: `Bearer ${token}` },
 *   })
 *   return jsonResponse(res.data, 200, headers)
 * })
 * ```
 *
 * The helper:
 * 1. Extracts access token from request cookies
 * 2. Calls your function with the token
 * 3. If the function throws a 401/403 ("Token expired"), it:
 *    - Extracts refresh token from request cookies
 *    - Calls the backend refresh endpoint directly
 *    - Retries your function with the new access token
 *    - Adds Set-Cookie headers to update httpOnly cookies
 * 4. If refresh fails, returns a 401 Response
 */

interface WithAuthOptions {
  /** If true, returns 401 immediately when no access token is found (default: true) */
  requireAuth?: boolean
}

/**
 * Check if an error is a token expiration error (401 or 403 with "Token expired").
 */
export function isTokenExpiredError(error: any): boolean {
  const status = error?.response?.status
  const errorMessage =
    error?.response?.data?.error || error?.response?.data?.message || ''

  return (
    status === 401 ||
    (status === 403 &&
      typeof errorMessage === 'string' &&
      errorMessage.includes('Token expired'))
  )
}

/**
 * Execute a BFF handler with automatic token refresh on 401/403.
 *
 * @param request - The incoming Request object from TanStack Start
 * @param fn - Your handler function. Receives (accessToken, responseHeaders).
 *             The responseHeaders may contain Set-Cookie for refreshed tokens.
 *             You should include these headers in your Response.
 * @param options - Optional configuration
 * @returns Response from your handler, or a 401 Response if auth fails
 */
export async function withAuth(
  request: Request,
  fn: (accessToken: string, headers: Headers) => Promise<Response>,
  options: WithAuthOptions = {},
): Promise<Response> {
  const { requireAuth = true } = options

  const accessToken = getAccessTokenFromCookie(request)

  if (!accessToken) {
    if (requireAuth) {
      return new Response(
        JSON.stringify({
          status: 401,
          message: 'Not authenticated',
          error: true,
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      )
    }
    // If auth is not required, call fn with empty token
    return fn('', new Headers())
  }

  try {
    // First attempt with current access token
    return await fn(accessToken, new Headers())
  } catch (error: any) {
    if (!isTokenExpiredError(error)) {
      // Not an auth error — rethrow
      throw error
    }

    // Attempt token refresh
    const refreshResult = await refreshTokensServerSide(request)

    if (!refreshResult) {
      // Refresh failed — return 401
      return new Response(
        JSON.stringify({
          status: 401,
          message: 'Session expired. Please log in again.',
          error: true,
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Retry the original request with the new access token
    // Pass Set-Cookie headers so the browser gets the updated tokens
    const refreshHeaders = new Headers()
    for (const cookie of refreshResult.setCookieHeaders) {
      refreshHeaders.append('Set-Cookie', cookie)
    }

    return await fn(refreshResult.accessToken, refreshHeaders)
  }
}

// ─────────────────────────────────────────────────────────
// Internal: Server-side token refresh
// ─────────────────────────────────────────────────────────

interface RefreshResult {
  accessToken: string
  setCookieHeaders: string[]
}

/**
 * Refresh tokens by calling the backend directly from the server side.
 * This bypasses the BFF refresh route and talks to the backend refresh endpoint.
 */
async function refreshTokensServerSide(
  request: Request,
): Promise<RefreshResult | null> {
  try {
    const cookieHeader = request.headers.get('cookie')
    const cookies = parseCookies(cookieHeader)
    const refreshToken = cookies['refresh_token']

    if (!refreshToken) {
      console.error('[withAuth] No refresh token found in cookies')
      return null
    }

    // Call the backend refresh endpoint directly
    const response = await axiosInstance.post('/users/auth/refresh', null, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        Accept: 'application/json',
      },
    })

    // Backend returns: { status: true, refresh_token, access_token }
    if (response.data?.access_token && response.data?.refresh_token) {
      const { access_token, refresh_token } = response.data

      console.log('[withAuth] Token refreshed successfully')

      // Build Set-Cookie headers for the new tokens
      const isProduction = process.env.NODE_ENV === 'production'
      const secure = isProduction ? 'Secure;' : ''
      const setCookieHeaders = [
        `access_token=${access_token}; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; ${secure} SameSite=strict; Path=/`,
        `refresh_token=${refresh_token}; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; ${secure} SameSite=strict; Path=/`,
      ]

      return {
        accessToken: access_token,
        setCookieHeaders,
      }
    }

    console.error(
      '[withAuth] Backend refresh returned unexpected data:',
      response.data,
    )
    return null
  } catch (error: any) {
    console.error(
      '[withAuth] Token refresh failed:',
      error?.response?.data || error.message,
    )
    return null
  }
}

/**
 * Helper to merge withAuth headers into your Response headers.
 * Use this when building responses inside a withAuth callback.
 *
 * @example
 * ```ts
 * return withAuth(request, async (token, authHeaders) => {
 *   const data = await axiosInstance.get('/endpoint', {
 *     headers: { Authorization: `Bearer ${token}` },
 *   })
 *   return jsonResponse(data.data, 200, authHeaders)
 * })
 * ```
 */
export function jsonResponse(
  data: unknown,
  status: number = 200,
  extraHeaders?: Headers,
): Response {
  const headers = new Headers({ 'Content-Type': 'application/json' })

  if (extraHeaders) {
    extraHeaders.forEach((value, key) => {
      headers.append(key, value)
    })
  }

  return new Response(JSON.stringify(data), { status, headers })
}
