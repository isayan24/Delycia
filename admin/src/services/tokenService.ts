import axios from 'axios'

/**
 * Singleton service for client-side token refresh.
 *
 * Registers interceptors on the GLOBAL axios instance (used for client→BFF calls).
 * When a BFF route returns 401/403, this interceptor calls /api/auth/refresh
 * (the BFF refresh route), which handles the actual backend token refresh.
 *
 * IMPORTANT: This is client-side only. Server-side BFF routes use withAuth() instead.
 */
class TokenService {
  private static instance: TokenService
  private refreshPromise: Promise<boolean> | null = null
  private onLogoutCallback: (() => void) | null = null
  private interceptorsRegistered = false

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
   * Setup Axios interceptors to handle 401s on the global axios instance.
   * This method is idempotent — safe to call multiple times.
   */
  setupInterceptors() {
    // Guard: only register once
    if (this.interceptorsRegistered) return
    this.interceptorsRegistered = true

    // Only register on client side
    if (typeof window === 'undefined') return

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (!originalRequest) return Promise.reject(error)

        // Check if this is a token expiration error
        const status = error.response?.status
        const responseData = error.response?.data
        const isTokenError =
          status === 401 ||
          (status === 403 &&
            responseData?.error === 'Forbidden : Token expired.')

        // Check if session is completely expired (no refresh token)
        const isSessionExpired = responseData?.sessionExpired === true

        // Skip retry for auth endpoints and already-retried requests
        const isAuthEndpoint =
          originalRequest.url?.includes('/api/auth/login') ||
          originalRequest.url?.includes('/api/auth/refresh') ||
          originalRequest.url?.includes('/api/auth/logout')

        if (isTokenError && !originalRequest._retry && !isAuthEndpoint) {
          originalRequest._retry = true

          // If session is completely expired, don't try to refresh
          if (isSessionExpired) {
            console.log(
              '[TokenService] Session completely expired, triggering logout',
            )
            this.triggerLogout()
            return Promise.reject(error)
          }

          try {
            const refreshSuccess = await this.refreshTokens()

            if (refreshSuccess) {
              // Retry the original request — cookies are already updated
              return axios(originalRequest)
            } else {
              console.log('[TokenService] Refresh failed, triggering logout')
              this.triggerLogout()
              return Promise.reject(error)
            }
          } catch (refreshError) {
            console.log(
              '[TokenService] Refresh error, triggering logout',
              refreshError,
            )
            this.triggerLogout()
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      },
    )
  }

  /**
   * Refresh access and refresh tokens via the BFF server route.
   * Deduplicates concurrent refresh calls — only one network request is made.
   */
  async refreshTokens(): Promise<boolean> {
    // Deduplicate: if a refresh is already in-flight, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performTokenRefresh()

    try {
      return await this.refreshPromise
    } finally {
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const response = await axios.post(
        '/api/auth/refresh',
        {},
        { withCredentials: true },
      )

      return response.status === 200 && response.data?.statusCode === 200
    } catch (error: any) {
      console.error('[TokenService] Refresh failed:', error.message)
      return false
    }
  }

  private triggerLogout() {
    console.log('[TokenService] Triggering logout callback')
    if (this.onLogoutCallback) {
      this.onLogoutCallback()
    } else {
      console.warn(
        '[TokenService] No logout callback registered, redirecting to login',
      )
      // Fallback: redirect to login if no callback is set
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }
}

export default TokenService.getInstance()
