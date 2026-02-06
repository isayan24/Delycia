import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import qs from 'qs'

const SERVER_URL = process.env.VITE_SERVER_URL

const axiosInstance = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true, // Ensures httpOnly cookies are sent automatically
})

// Token refresh state management
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

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

// Response interceptor with automatic token refresh on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Handle 401 errors (Unauthorized)
    if (
      (error.response?.status === 401 ||
        (error.response?.status === 403 &&
          (error.response?.data as any)?.error ===
            'Forbidden : Token expired.')) &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Don't retry auth endpoints
      if (
        originalRequest.url?.includes('/api/auth/login') ||
        originalRequest.url?.includes('/api/auth/refresh') ||
        originalRequest.url?.includes('/api/auth/logout')
      ) {
        return Promise.reject(error)
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt to refresh the token
        const refreshResponse = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true },
        )

        if (
          refreshResponse.status === 200 &&
          refreshResponse.data?.statusCode === 200
        ) {
          // Token refreshed successfully, process queued requests
          processQueue(null)

          // Retry the original request
          return axiosInstance(originalRequest)
        } else {
          // Refresh failed
          processQueue(error)
          handleAuthFailure()
          return Promise.reject(error)
        }
      } catch (refreshError) {
        // Refresh request failed
        processQueue(error)
        handleAuthFailure()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
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

// Handle authentication failure - redirect to login
function handleAuthFailure() {
  console.error('Token refresh failed - redirecting to login')
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_user_data')
    window.location.href = '/login'
  }
}

export default axiosInstance
