import axios from 'axios'

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || 'http://localhost:8020/api'

/**
 * Pre-configured axios instance for superadmin BFF server routes → backend API calls.
 *
 * IMPORTANT: This instance does NOT handle token refresh.
 * Token refresh is handled in two places:
 *   - Client-side: tokenService.ts interceptors on the global axios instance
 *   - Server-side (BFF): withAuth() helper in lib/withAuth.ts
 *
 * This separation exists because server-side code cannot access browser cookies
 * from within an axios interceptor — only the BFF route handler has access to
 * the incoming Request object and its cookies.
 */
const axiosInstance = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
})

// Create a separate axios instance for fetching CSRF tokens to avoid interceptor loops
const csrfAxios = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
})

// Store CSRF token + cookie in memory (Double Submit Cookie pattern)
let csrfToken: string | null = null
let csrfCookie: string | null = null
let csrfTokenPromise: Promise<string> | null = null

// Function to fetch CSRF token AND capture the Set-Cookie header
async function fetchCsrfToken(): Promise<string> {
  // If already fetching, return the existing promise
  if (csrfTokenPromise) {
    return csrfTokenPromise
  }

  csrfTokenPromise = (async () => {
    try {
      const response = await csrfAxios.get('/superadmin/auth/csrf-token')
      csrfToken = response.data.csrfToken

      // Capture the CSRF cookie from the Set-Cookie response header.
      // Server-side axios does NOT persist cookies, so we must store it
      // and manually forward it on subsequent mutation requests.
      const setCookieHeader = response.headers['set-cookie']
      if (setCookieHeader) {
        const cookies = Array.isArray(setCookieHeader)
          ? setCookieHeader
          : [setCookieHeader]
        // Extract just the cookie name=value pairs (strip attributes like Path, HttpOnly, etc.)
        csrfCookie = cookies
          .map((c: string) => c.split(';')[0].trim())
          .join('; ')
      }

      return csrfToken!
    } catch (error) {
      console.error('❌ Failed to fetch CSRF token:', error)
      csrfToken = null
      csrfCookie = null
      throw error
    } finally {
      csrfTokenPromise = null
    }
  })()

  return csrfTokenPromise!
}

// Request interceptor — sets default headers and CSRF token
axiosInstance.interceptors.request.use(
  async (config) => {
    console.log(
      '🔧 Request interceptor triggered for:',
      config.method?.toUpperCase(),
      config.url,
    )

    // Set default Content-Type to application/json if not specified
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }

    // Set Accept header for all requests
    config.headers['Accept'] = 'application/json'

    // Add CSRF token + cookie for state-changing requests (Double Submit Cookie)
    if (
      config.method &&
      ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())
    ) {
      // Fetch CSRF token if we don't have one
      if (!csrfToken) {
        try {
          await fetchCsrfToken()
        } catch (error) {
          console.error('❌ Failed to get CSRF token:', error)
        }
      }

      // Add CSRF token header
      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken
      }

      // Forward the CSRF cookie that was captured from the token-fetch response.
      // Without this, server-side requests fail because axios doesn't persist cookies.
      if (csrfCookie) {
        // Merge with any existing cookies on the request
        const existingCookie = config.headers['Cookie'] || ''
        config.headers['Cookie'] = existingCookie
          ? `${existingCookie}; ${csrfCookie}`
          : csrfCookie
      }
    }

    return config
  },
  (error) => {
    console.error(
      '❌ API Request Error:',
      error.response?.data || error.message,
    )
    return Promise.reject(error)
  },
)

// Response interceptor — logging and CSRF token refresh on 403
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status, response.config.url)
    return response
  },
  async (error) => {
    console.log('❌ Response error:', error.response?.status, error.config?.url)

    // If we get a 403 with CSRF error, clear token and retry once
    if (
      error.response?.status === 403 &&
      error.response?.data?.error?.includes('CSRF')
    ) {
      csrfToken = null
      csrfCookie = null

      // Retry the request once with a new token
      const originalRequest = error.config
      if (!originalRequest._retry) {
        originalRequest._retry = true
        try {
          await fetchCsrfToken()
          if (csrfToken) {
            originalRequest.headers['x-csrf-token'] = csrfToken
            console.log('🔄 Retrying request with new CSRF token')
          }
          return axiosInstance(originalRequest)
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError)
          return Promise.reject(retryError)
        }
      }
    }

    // Log non-auth errors for debugging
    try {
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.error(
          'API Response Error:',
          error?.response?.data || error.message,
        )
      }
    } catch (err) {
      console.error('Error handling response:', err)
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
export { axiosInstance }
