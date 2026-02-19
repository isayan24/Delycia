import axios from 'axios'
import qs from 'qs'

const SERVER_URL = process.env.VITE_SERVER_URL

/**
 * Pre-configured axios instance for BFF server routes → backend API calls.
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
  timeout: 30000, // 30 second timeout to prevent hanging requests
})

// Request interceptor — sets default headers
axiosInstance.interceptors.request.use(
  (config) => {
    // For POST requests, transform JSON data to x-www-form-urlencoded format
    if (config.method === 'post' && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      if (config.data) {
        config.data = qs.stringify(config.data)
      }
    }

    // Set Accept header for all requests
    config.headers['Accept'] = 'application/json'

    return config
  },
  (error) => {
    console.error('API Request Error:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)

// Response interceptor — logging only, no auth logic
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Log errors for debugging
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      console.error(`[axios] Request timeout to ${error.config?.url}`)
    } else if (error.response) {
      console.error(
        `[axios] Error ${error.response.status} from ${error.config?.url}:`,
        error.response.data?.message || error.message,
      )
    } else if (error.request) {
      console.error(`[axios] Network error - no response received`)
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
