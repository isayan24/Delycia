import axios from 'axios'

// Superadmin user data interface (no tokens stored client-side)
export interface SuperadminUserData {
  _id: string
  id: number
  username?: string
  name?: string
  email?: string
  phone_number?: string
  profile_pic?: string
  role: number // Should be 1000 for superadmin
}

class SessionService {
  private static instance: SessionService
  private userDataCache: SuperadminUserData | null = null

  private constructor() {}

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService()
    }
    return SessionService.instance
  }

  /**
   * Set user data in memory (no tokens stored client-side)
   */
  setUserData(userData: SuperadminUserData): void {
    try {
      this.userDataCache = userData

      // Optionally persist to localStorage for non-sensitive data only
      if (typeof window !== 'undefined') {
        const stringified = JSON.stringify(userData)
        localStorage.setItem('superadmin_user_data', stringified)

        // Dispatch custom event to notify listeners in the same tab
        window.dispatchEvent(
          new CustomEvent('userDataChanged', { detail: userData }),
        )
      }
    } catch (error) {
      console.error('Failed to set user data:', error)
    }
  }

  /**
   * Get user data from memory or localStorage
   */
  getUserData(): SuperadminUserData | null {
    try {
      // Return cached data if available
      if (this.userDataCache) {
        return this.userDataCache
      }

      // Try to get from localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('superadmin_user_data')
        if (stored) {
          this.userDataCache = JSON.parse(stored)
          return this.userDataCache
        }
      }

      return null
    } catch (error) {
      console.error('Failed to get user data:', error)
      return null
    }
  }

  /**
   * Clear user data from memory and localStorage
   */
  clearSession(): void {
    try {
      this.userDataCache = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('superadmin_user_data')
      }
    } catch (error) {
      console.error('Failed to clear session:', error)
    }
  }

  /**
   * Check if session is valid
   * For now, just check if user data exists in localStorage
   * TODO: Implement proper server-side session validation when BFF routes are ready
   */
  async isSessionValid(): Promise<boolean> {
    try {
      const userData = this.getUserData()
      return userData !== null && userData.role === 1000
    } catch (error) {
      console.error('Session validation failed:', error)
      return false
    }
  }

  /**
   * Verify user has superadmin role
   */
  isSuperadmin(): boolean {
    const userData = this.getUserData()
    return userData?.role === 1000
  }
}

export default SessionService.getInstance()
