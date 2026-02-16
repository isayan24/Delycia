import axios from 'axios'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8020/api'

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

// Store CSRF token in memory
let csrfToken: string | null = null
let csrfTokenPromise: Promise<string> | null = null

// Function to fetch CSRF token
async function fetchCsrfToken(): Promise<string> {
  // If already fetching, return the existing promise
  if (csrfTokenPromise) {
    console.log('⏳ CSRF token fetch already in progress, waiting...')
    return csrfTokenPromise
  }

  csrfTokenPromise = (async () => {
    try {
      console.log('🔄 Fetching CSRF token from:', `${SERVER_URL}/superadmin/auth/csrf-token`)
      const response = await csrfAxios.get('/superadmin/auth/csrf-token')
      console.log('✅ CSRF token response:', response.data)
      csrfToken = response.data.csrfToken
      console.log('💾 CSRF token stored:', csrfToken?.substring(0, 20) + '...')
      return csrfToken
    } catch (error) {
      console.error('❌ Failed to fetch CSRF token:', error)
      csrfToken = null
      throw error
    } finally {
      csrfTokenPromise = null
    }
  })()

  return csrfTokenPromise
}

// Request interceptor — sets default headers and CSRF token
axiosInstance.interceptors.request.use(
  async (config) => {
    console.log('🔧 Request interceptor triggered for:', config.method?.toUpperCase(), config.url)
    
    // Set default Content-Type to application/json if not specified
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }

    // Set Accept header for all requests
    config.headers['Accept'] = 'application/json'

    // Add CSRF token for state-changing requests
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      console.log('🔒 State-changing request detected, checking CSRF token...')
      
      // Fetch CSRF token if we don't have one
      if (!csrfToken) {
        console.log('⚠️ No CSRF token in memory, fetching...')
        try {
          await fetchCsrfToken()
        } catch (error) {
          console.error('❌ Failed to get CSRF token:', error)
        }
      } else {
        console.log('✅ Using existing CSRF token:', csrfToken.substring(0, 20) + '...')
      }
      
      // Add CSRF token to headers
      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken
        console.log('✅ CSRF token added to request headers')
      } else {
        console.error('❌ No CSRF token available to add to request')
      }
    }

    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error.response?.data || error.message)
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
      console.log('🔄 CSRF token invalid, fetching new token...')
      csrfToken = null // Clear the invalid token
      
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
