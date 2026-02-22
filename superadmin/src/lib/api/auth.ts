import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import axios from 'axios'

const SERVER_URL = process.env.VITE_SERVER_URL || 'http://localhost:8020/api'
const authAxios = axios.create({ baseURL: SERVER_URL })
import { getAccessTokenFromCookie } from '../server-cookies'

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

export interface SuperadminUser {
  _id: string
  id: number
  username?: string
  name?: string
  email?: string
  phone_number?: string
  profile_pic?: string
  role: number
}

export interface LoginResponse {
  status: boolean
  statusCode: number
  message: string
  data?: SuperadminUser
  error?: string
}

// ─────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

// ─────────────────────────────────────────────────────────
// Cookie helpers
// ─────────────────────────────────────────────────────────

/**
 * Parse a token value out of a Set-Cookie header string.
 * Example: "access_token=eyJ...; Max-Age=..." → "eyJ..."
 */
function extractTokenFromSetCookie(
  setCookieHeaders: string[],
  cookieName: string,
): string | null {
  for (const header of setCookieHeaders) {
    const parts = header.split(';')
    const kvPair = parts[0].trim()
    const eqIndex = kvPair.indexOf('=')
    if (eqIndex === -1) continue
    const name = kvPair.substring(0, eqIndex).trim()
    const value = kvPair.substring(eqIndex + 1).trim()
    if (name === cookieName && value) {
      return value
    }
  }
  return null
}

function buildClearCookieString(name: string): string {
  const isProduction = process.env.NODE_ENV === 'production'
  const secure = isProduction ? 'Secure; ' : ''
  return `${name}=; Max-Age=0; HttpOnly; ${secure}SameSite=Lax; Path=/`
}

// ─────────────────────────────────────────────────────────
// Server Functions
// ─────────────────────────────────────────────────────────

/**
 * BFF Login — proxies credentials to backend.
 *
 * The backend sets httpOnly cookies for `access_token` and `refresh_token`
 * on its own origin (port 8020). Since the browser only sends cookies to the
 * origin that set them, those cookies are invisible to the BFF's server functions
 * which run on port 5000.
 *
 * Strategy: Intercept the `Set-Cookie` response headers from the backend axios
 * call (visible server-side), extract the token values, and re-issue them as
 * `superadmin_access_token` / `superadmin_refresh_token` cookies on port 5000
 * so all subsequent BFF server functions can read them.
 */
export const loginServer = createServerFn({ method: 'POST' })
  .inputValidator((data: z.infer<typeof loginSchema>) =>
    loginSchema.parse(data),
  )
  .handler(async ({ data }) => {
    try {
      // Step 1: Get CSRF token from backend using clean authAxios
      const csrfResponse = await authAxios.get('/superadmin/auth/csrf-token')
      const csrfToken: string | undefined = csrfResponse.data?.csrfToken

      // Extract the x-csrf-token cookie from the response headers
      const rawCsrfCookies: string[] = Array.isArray(
        csrfResponse.headers['set-cookie'],
      )
        ? csrfResponse.headers['set-cookie']
        : csrfResponse.headers['set-cookie']
          ? [csrfResponse.headers['set-cookie']]
          : []
      const csrfCookieValue = extractTokenFromSetCookie(
        rawCsrfCookies,
        'x-csrf-token',
      )

      // Step 2: POST login credentials to backend
      // Using authAxios avoids the default axiosInstance request interceptors
      // which would overwrite the x-csrf-token header with a cached, mismatched token.
      const response = await authAxios.post(
        '/superadmin/auth/login',
        {
          email: data.email,
          username: data.username,
          password: data.password,
        },
        {
          headers: {
            ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
            ...(csrfCookieValue
              ? { Cookie: `x-csrf-token=${csrfCookieValue}` }
              : {}),
          },
          // Prevent axios from throwing on non-2xx so we can always read headers
          validateStatus: () => true,
        },
      )

      const responseData = response.data

      if (response.status !== 200 || responseData?.statusCode !== 200) {
        return new Response(JSON.stringify(responseData), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Step 3: Forward backend's Set-Cookie headers directly to the browser.
      // The backend controller calls res.cookie('superadmin_access_token', ...) and
      // res.cookie('superadmin_refresh_token', ...).
      // We just need to pass these headers through.
      const rawSetCookies: string[] = Array.isArray(
        response.headers['set-cookie'],
      )
        ? response.headers['set-cookie']
        : response.headers['set-cookie']
          ? [response.headers['set-cookie']]
          : []

      // Extract and rewrite the cookies to ensure they are accepted on HTTP localhost
      const setCookieHeaders = rawSetCookies
        .filter(
          (cookie) =>
            cookie.startsWith('superadmin_access_token') ||
            cookie.startsWith('superadmin_refresh_token'),
        )
        .map((cookie) => cookie.replace(/SameSite=None/gi, 'SameSite=Lax'))

      if (setCookieHeaders.length === 0) {
        console.error(
          '[loginServer] Could not find superadmin_* cookies in backend response',
          rawSetCookies,
        )
        return new Response(
          JSON.stringify({
            status: false,
            error: 'Authentication failed: tokens not received',
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } },
        )
      }

      // Return user data (no tokens in body)
      const safeResponseData = {
        status: responseData.status,
        statusCode: responseData.statusCode,
        message: responseData.message,
        data: responseData.data,
      }

      const headers = new Headers({ 'Content-Type': 'application/json' })
      setCookieHeaders.forEach((cookie) => headers.append('Set-Cookie', cookie))

      return new Response(JSON.stringify(safeResponseData), {
        status: 200,
        headers,
      })
    } catch (error: any) {
      console.error(
        '[loginServer] Login error:',
        error?.response?.data || error.message,
      )
      const status = error?.response?.status || 500
      const errorData = error?.response?.data || {
        status: false,
        error: 'Login failed. Please try again.',
      }
      return new Response(JSON.stringify(errorData), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  })

/**
 * BFF Logout — clears tokens from backend DB and clears BFF-origin cookies.
 */
export const logoutServer = createServerFn({ method: 'POST' }).handler(
  async () => {
    const accessToken = await getAccessTokenFromCookie()

    try {
      if (accessToken) {
        const csrfResponse = await authAxios.get('/superadmin/auth/csrf-token')
        const csrfToken = csrfResponse.data?.csrfToken

        const rawCsrfCookies: string[] = Array.isArray(
          csrfResponse.headers['set-cookie'],
        )
          ? csrfResponse.headers['set-cookie']
          : csrfResponse.headers['set-cookie']
            ? [csrfResponse.headers['set-cookie']]
            : []
        const csrfCookieValue = extractTokenFromSetCookie(
          rawCsrfCookies,
          'x-csrf-token',
        )

        await authAxios.post(
          '/superadmin/auth/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
              ...(csrfCookieValue
                ? { Cookie: `x-csrf-token=${csrfCookieValue}` }
                : {}),
            },
            validateStatus: () => true,
          },
        )
      }
    } catch {
      // Ignore backend errors — we still clear our cookies
    }

    const clearHeaders = [
      buildClearCookieString('superadmin_access_token'),
      buildClearCookieString('superadmin_refresh_token'),
    ]

    const headers = new Headers({ 'Content-Type': 'application/json' })
    clearHeaders.forEach((cookie) => headers.append('Set-Cookie', cookie))

    return new Response(
      JSON.stringify({ status: true, message: 'Logged out successfully' }),
      {
        status: 200,
        headers,
      },
    )
  },
)
