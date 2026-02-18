import { getAccessTokenFromCookie } from './server-cookies'
import { refreshCoordinator } from './refreshCoordinator'
import { tokenCache } from './tokenCache'
import { parseCookies } from './server-cookies'

/**
 * Server-side (BFF) auth helper that handles token refresh transparently.
 *
 * This helper uses the RefreshCoordinator to ensure only ONE token refresh
 * happens at a time, even when multiple concurrent requests need a refresh.
 *
 * Usage in any BFF route handler:
 * ```ts
 * return withAuth(request, async (token, headers) => {
 *   const res = await axiosInstance.get('/admin/dashboard/stats', {
 *     headers: { Authorization: `Bearer ${token}` },
 *   })
 *   return new Response(JSON.stringify(res.data), {
 *     status: 200,
 *     headers: { ...Object.fromEntries(headers.entries()), 'Content-Type': 'application/json' },
 *   })
 * })
 * ```
 *
 * The helper:
 * 1. Extracts access token from request cookies
 * 2. Calls your function with the token
 * 3. If the function throws a 401/403 ("Token expired"), it:
 *    - Delegates to RefreshCoordinator for token refresh
 *    - Retries your function with the new access token (ONCE)
 *    - Adds Set-Cookie headers to update httpOnly cookies
 * 4. If refresh fails or retry still fails, returns a 401 Response
 */

interface WithAuthOptions {
  /** If true, returns 401 immediately when no access token is found (default: true) */
  requireAuth?: boolean
  /** Internal: tracks if this is a retry after refresh (prevents infinite loops) */
  _isRetry?: boolean
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
  const { requireAuth = true, _isRetry = false } = options

  // First, try to get the freshest token from cache
  const cookieHeader = request.headers.get('cookie')
  const cookies = parseCookies(cookieHeader)
  const refreshToken = cookies['admin_refresh_token']
  
  let accessToken = getAccessTokenFromCookie(request)
  
  // Check if we have a fresher token in cache (from a recent refresh)
  if (refreshToken) {
    const cachedToken = tokenCache.get(refreshToken)
    if (cachedToken) {
      accessToken = cachedToken
    }
  }

  if (!accessToken) {
    if (!requireAuth) {
      return fn('', new Headers())
    }

    // Attempt refresh through coordinator
    const refreshResult = await refreshCoordinator.refreshTokens(request)

    if (!refreshResult) {
      // Clear expired cookies
      const clearCookieHeaders = new Headers()
      clearCookieHeaders.append(
        'Set-Cookie',
        'admin_access_token=; Max-Age=0; HttpOnly; SameSite=strict; Path=/',
      )
      clearCookieHeaders.append(
        'Set-Cookie',
        'admin_refresh_token=; Max-Age=0; HttpOnly; SameSite=strict; Path=/',
      )

      return new Response(
        JSON.stringify({
          status: 401,
          message: 'Session expired. Please log in again.',
          error: true,
          sessionExpired: true,
        }),
        { status: 401, headers: clearCookieHeaders },
      )
    }

    // Retry with new token
    const refreshHeaders = new Headers()
    for (const cookie of refreshResult.setCookieHeaders) {
      refreshHeaders.append('Set-Cookie', cookie)
    }

    return await fn(refreshResult.accessToken, refreshHeaders)
  }

  try {
    // First attempt with current access token
    return await fn(accessToken, new Headers())
  } catch (error: any) {
    // Check if this is a token expiration error (401 or 403 with "Token expired")
    const status = error?.response?.status
    const errorMessage =
      error?.response?.data?.error || error?.response?.data?.message || ''
    const isTokenExpired =
      status === 401 ||
      (status === 403 &&
        typeof errorMessage === 'string' &&
        errorMessage.includes('Token expired'))

    if (!isTokenExpired) {
      // Not an auth error — rethrow
      throw error
    }

    // If this is already a retry, don't try again (prevent infinite loops)
    if (_isRetry) {
      console.error(
        '[withAuth] Token refresh retry failed - backend still rejecting token',
      )
      const clearCookieHeaders = new Headers({
        'Content-Type': 'application/json',
      })
      clearCookieHeaders.append(
        'Set-Cookie',
        'admin_access_token=; Max-Age=0; HttpOnly; SameSite=strict; Path=/',
      )
      clearCookieHeaders.append(
        'Set-Cookie',
        'admin_refresh_token=; Max-Age=0; HttpOnly; SameSite=strict; Path=/',
      )

      return new Response(
        JSON.stringify({
          status: 401,
          message: 'Session expired. Please log in again.',
          error: true,
          sessionExpired: true,
        }),
        { status: 401, headers: clearCookieHeaders },
      )
    }

    // Token expired → attempt refresh through coordinator
    const refreshResult = await refreshCoordinator.refreshTokens(request)

    if (!refreshResult) {
      // Clear expired cookies
      const clearCookieHeaders = new Headers({
        'Content-Type': 'application/json',
      })
      clearCookieHeaders.append(
        'Set-Cookie',
        'admin_access_token=; Max-Age=0; HttpOnly; SameSite=strict; Path=/',
      )
      clearCookieHeaders.append(
        'Set-Cookie',
        'admin_refresh_token=; Max-Age=0; HttpOnly; SameSite=strict; Path=/',
      )

      return new Response(
        JSON.stringify({
          status: 401,
          message: 'Session expired. Please log in again.',
          error: true,
          sessionExpired: true,
        }),
        { status: 401, headers: clearCookieHeaders },
      )
    }

    // Retry with new token (mark as retry to prevent infinite loops)
    const refreshHeaders = new Headers()
    for (const cookie of refreshResult.setCookieHeaders) {
      refreshHeaders.append('Set-Cookie', cookie)
    }

    try {
      return await fn(refreshResult.accessToken, refreshHeaders)
    } catch (retryError: any) {
      // If retry also fails with auth error, give up and force logout
      const retryStatus = retryError?.response?.status
      if (retryStatus === 401 || retryStatus === 403) {
        console.error(
          '[withAuth] Retry with refreshed token failed - forcing logout',
        )
        const clearCookieHeaders = new Headers({
          'Content-Type': 'application/json',
        })
        clearCookieHeaders.append(
          'Set-Cookie',
          'admin_access_token=; Max-Age=0; HttpOnly; SameSite=strict; Path=/',
        )
        clearCookieHeaders.append(
          'Set-Cookie',
          'admin_refresh_token=; Max-Age=0; HttpOnly; SameSite=strict; Path=/',
        )

        return new Response(
          JSON.stringify({
            status: 401,
            message: 'Session expired. Please log in again.',
            error: true,
            sessionExpired: true,
          }),
          { status: 401, headers: clearCookieHeaders },
        )
      }
      // If it's not an auth error, rethrow
      throw retryError
    }
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
