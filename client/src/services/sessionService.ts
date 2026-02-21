'use client'

export interface UserData {
  _id: string
  id: number | string
  country_code: string
  phone_number: string
  role: number
  name?: string
  username?: string
  email?: string
  profile_pic?: string
  restaurant_rids?: number[]
}

const USER_DATA_KEY = 'user_data'

class SessionService {
  private static instance: SessionService
  private userDataCache: UserData | null = null

  private constructor() {}

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService()
    }
    return SessionService.instance
  }

  /**
   * Set user data in memory and localStorage (for persistence across reloads)
   */
  setUserData(userData: UserData): void {
    try {
      // Check if data is same as cache to avoid infinite loops
      if (
        this.userDataCache &&
        JSON.stringify(this.userDataCache) === JSON.stringify(userData)
      ) {
        return
      }

      this.userDataCache = userData
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
          console.log('[SessionService] User data saved to localStorage')
        } catch (storageError) {
          console.error(
            '[SessionService] Failed to save to localStorage:',
            storageError,
          )
          // Continue even if localStorage fails (e.g., in private browsing mode)
        }
      }

      // Dispatch event for other tabs/components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('userDataChanged', { detail: userData }),
        )
      }
    } catch (error) {
      console.error('[SessionService] Failed to set user data:', error)
    }
  }

  /**
   * Get user data from memory or localStorage
   */
  getUserData(): UserData | null {
    try {
      if (this.userDataCache) {
        return this.userDataCache
      }

      if (typeof window !== 'undefined') {
        const storedValue = localStorage.getItem(USER_DATA_KEY)
        if (storedValue) {
          try {
            this.userDataCache = JSON.parse(storedValue)
            console.log('[SessionService] User data loaded from localStorage')
            return this.userDataCache
          } catch (parseError) {
            console.error(
              '[SessionService] Failed to parse stored user data:',
              parseError,
            )
            // Clear corrupted data
            localStorage.removeItem(USER_DATA_KEY)
            return null
          }
        }
      }

      return null
    } catch (error) {
      console.error('[SessionService] Failed to get user data:', error)
      return null
    }
  }

  /**
   * Clear user data
   */
  clearSession(): void {
    try {
      this.userDataCache = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_DATA_KEY)
        console.log('[SessionService] Session cleared')
      }
    } catch (error) {
      console.error('[SessionService] Failed to clear session:', error)
    }
  }
}

export default SessionService.getInstance()
