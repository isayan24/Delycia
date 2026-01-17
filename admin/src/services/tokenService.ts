import axios from 'axios'

class TokenService {
  private static instance: TokenService
  private refreshPromise: Promise<boolean> | null = null

  private constructor() {}

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService()
    }
    return TokenService.instance
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
