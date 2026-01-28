import axios from 'axios'
import qs from 'qs'

const SERVER_URL = import.meta.env.SERVER_URL || process.env.SERVER_URL

const axiosInstance = axios.create({
  baseURL: SERVER_URL || 'http://localhost:8020/api/v1',
  withCredentials: true, // Ensures httpOnly cookies are sent automatically
})

// Request interceptor
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

    // Note: Bearer token is NOT needed here!
    // Server routes handle adding Bearer tokens from httpOnly cookies

    return config
  },
  (error) => {
    console.error('API Request Error:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)

// Response interceptor with 401 handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 errors (Unauthorized) - redirect to login
    if (error.response?.status === 401) {
      console.error('Unauthorized - redirecting to login')

      // Clear any client-side session data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_user_data')
        window.location.href = '/login'
      }

      return Promise.reject(error)
    }

    // Log other errors
    try {
      console.error(
        'API Response Error:',
        error?.response?.data || error.message,
      )
    } catch (err) {
      console.error('Error handling response:', err)
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
