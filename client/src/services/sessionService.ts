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
   * Set user data in memory and cookie (for persistence across reloads)
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
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
      }

      // Dispatch event for other tabs/components
      if (typeof window !== 'undefined') {
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
  getUserData(): UserData | null {
    try {
      if (this.userDataCache) {
        return this.userDataCache
      }

      if (typeof window !== 'undefined') {
        const storedValue = localStorage.getItem(USER_DATA_KEY)
        if (storedValue) {
          this.userDataCache = JSON.parse(storedValue)
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
   * Clear user data
   */
  clearSession(): void {
    try {
      this.userDataCache = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_DATA_KEY)
      }
    } catch (error) {
      console.error('Failed to clear session:', error)
    }
  }
}

export default SessionService.getInstance()
