import axios from 'axios'
import { sessionEventEmitter } from './sessionEventEmitter'

/**
 * Global Axios Interceptor for Session Error Detection
 *
 * This interceptor catches all 401 authentication errors from axios requests,
 * including those made outside of TanStack Query (e.g., direct axios calls in useAuth).
 */

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => {
    // If request succeeds, just return the response
    return response
  },
  (error) => {
    // Check if it's a 401 error
    if (error.response?.status === 401) {
      const message = error.response?.data?.message || 'Authentication failed'

      // Determine error type
      let errorType: 'SESSION_EXPIRED' | 'IDLE_TOO_LONG' | 'UNAUTHORIZED' =
        'UNAUTHORIZED'
      const lowerMessage = message.toLowerCase()

      if (lowerMessage.includes('expired')) {
        errorType = 'SESSION_EXPIRED'
      } else if (lowerMessage.includes('idle')) {
        errorType = 'IDLE_TOO_LONG'
      } else if (lowerMessage.includes('no session')) {
        errorType = 'SESSION_EXPIRED'
      }

      // Emit session error event
      sessionEventEmitter.emit({
        type: errorType,
        message,
        timestamp: Date.now(),
      })
    }

    // Always reject the promise so the error can still be handled by the caller
    return Promise.reject(error)
  },
)

export default axios
