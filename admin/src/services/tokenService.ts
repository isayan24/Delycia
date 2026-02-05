import axios from 'axios'

class TokenService {
  private static instance: TokenService
  private refreshPromise: Promise<boolean> | null = null
  private onLogoutCallback: (() => void) | null = null

  private constructor() {}

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService()
    }
    return TokenService.instance
  }

  /**
   * Register a callback to be called when refresh fails completely
   */
  setOnLogout(callback: () => void) {
    this.onLogoutCallback = callback
  }

  /**
   * Setup Axios interceptors to handle 401s
   */
  setupInterceptors() {
    // Response interceptor
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // If error is 401 and we haven't retried yet
        if (
          (error.response?.status === 401 ||
            (error.response?.status === 403 &&
              (error.response?.data as any)?.error ===
                'Forbidden : Token expired.')) &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/api/auth/login') && // Don't retry login
          !originalRequest.url?.includes('/api/auth/refresh') // Don't retry refresh itself
        ) {
          originalRequest._retry = true

          try {
            const refreshSuccess = await this.refreshTokens()

            if (refreshSuccess) {
              // Retry the original request
              return axios(originalRequest)
            } else {
              // Refresh failed, trigger logout
              if (this.onLogoutCallback) {
                this.onLogoutCallback()
              }
              return Promise.reject(error)
            }
          } catch (refreshError) {
            // Refresh process error, trigger logout
            if (this.onLogoutCallback) {
              this.onLogoutCallback()
            }
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      },
    )
  }

  /**
   * Refresh access and refresh tokens via server route
   */
  async refreshTokens(): Promise<boolean> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performTokenRefresh()
    const result = await this.refreshPromise
    this.refreshPromise = null

    return result
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const response = await axios.post(
        '/api/auth/refresh',
        {},
        {
          withCredentials: true, // Send httpOnly cookies
        },
      )

      if (response.status === 200 && response.data?.statusCode === 200) {
        return true
      }

      return false
    } catch (error: any) {
      console.error('Failed to refresh tokens:', error.message)
      return false
    }
  }
}

export default TokenService.getInstance()
