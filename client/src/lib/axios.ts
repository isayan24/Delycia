import axios from 'axios'
import qs from 'qs'

const axiosInstance = axios.create({
  // Use environment variable for API base URL (production vs development)
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8020/api/v1',
  withCredentials: true, // ensures cookies are sent automatically
  timeout: 30000, // 30 second timeout to prevent hanging requests
})

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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ignore canceled requests
    if (axios.isCancel(error) || error.name === 'CanceledError') {
      return Promise.reject(error)
    }

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
