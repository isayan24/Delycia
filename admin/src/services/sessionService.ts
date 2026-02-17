import axios from 'axios'
// Simplified user data interface (no tokens)
export interface UserData {
  _id: string
  id: number // Changed from string to number to match backend
  username?: string
  name?: string
  email?: string
  phone_number: string
  profile_pic?: string
  role: number
  restaurant_rids: number[]
  selected_rid: number | null
}

// Interface for partial user updates
export interface UserUpdateData {
  selected_rid?: number | null
  restaurant_rids?: number[]
  role?: number
  phone_number?: string
}

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
   * Helper to check if two UserData objects are equal
   */
  private isEqual(a: UserData | null, b: UserData | null): boolean {
    if (!a || !b) return a === b
    return JSON.stringify(a) === JSON.stringify(b)
  }

  /**
   * Set user data in memory (no tokens stored client-side)
   */
  setUserData(userData: UserData): void {
    try {
      // Avoid redundant updates
      if (this.isEqual(this.userDataCache, userData)) {
        return
      }

      this.userDataCache = userData

      // Optionally persist to localStorage for non-sensitive data only
      if (typeof window !== 'undefined') {
        const stringified = JSON.stringify(userData)

        // Check LC before setting to avoid triggering storage events unnecessarily
        const currentStored = localStorage.getItem('admin_user_data')
        if (currentStored !== stringified) {
          localStorage.setItem('admin_user_data', stringified)

          // Dispatch custom event to notify listeners in the same tab
          window.dispatchEvent(
            new CustomEvent('userDataChanged', { detail: userData }),
          )
        }
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
      // Return cached data if available
      if (this.userDataCache) {
        return this.userDataCache
      }

      // Try to get from localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('admin_user_data')
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
        localStorage.removeItem('admin_user_data')
      }
    } catch (error) {
      console.error('Failed to clear session:', error)
    }
  }

  /**
   * Check if session is valid by calling server route
   */
  async isSessionValid(): Promise<boolean> {
    try {
      const response = await axios.get('/api/auth/session', {
        withCredentials: true, // Send httpOnly cookies
      })

      if (response.status === 200) {
        const data = response.data
        return data.isAuthenticated === true
      }

      return false
    } catch (error) {
      console.error('Session validation failed:', error)
      return false
    }
  }

  /**
   * Update user details in the session
   */
  updateUserDetails(updates: UserUpdateData): boolean {
    try {
      const currentData = this.getUserData()
      if (!currentData) {
        console.error('No user data found to update')
        return false
      }

      // Validate selected_rid if provided
      if (updates.selected_rid !== undefined) {
        if (
          updates.selected_rid !== null &&
          currentData.restaurant_rids &&
          !currentData.restaurant_rids.includes(updates.selected_rid)
        ) {
          console.error(
            `Selected restaurant ID ${updates.selected_rid} is not in user's accessible restaurants`,
          )
          return false
        }
      }

      // Create updated user data
      const updatedData: UserData = {
        ...currentData,
        ...(updates.selected_rid !== undefined && {
          selected_rid: updates.selected_rid,
        }),
        ...(updates.restaurant_rids !== undefined && {
          restaurant_rids: updates.restaurant_rids,
        }),
        ...(updates.role !== undefined && { role: updates.role }),
        ...(updates.phone_number !== undefined && {
          phone_number: updates.phone_number,
        }),
      }

      // Store the updated data
      this.setUserData(updatedData)

      return true
    } catch (error) {
      console.error('Failed to update user details:', error)
      return false
    }
  }

  /**
   * Update selected restaurant ID
   */
  updateSelectedRestaurant(restaurantId: number): boolean {
    return this.updateUserDetails({ selected_rid: restaurantId })
  }

  /**
   * Get the currently selected restaurant ID
   */
  getSelectedRestaurantId(): number | null {
    const userData = this.getUserData()
    return userData?.selected_rid || null
  }

  /**
   * Get list of accessible restaurant IDs
   */
  getAccessibleRestaurantIds(): number[] {
    const userData = this.getUserData()
    return userData?.restaurant_rids || []
  }

  /**
   * Check if a restaurant ID is accessible to the current user
   */
  isRestaurantAccessible(restaurantId: number): boolean {
    const accessibleIds = this.getAccessibleRestaurantIds()
    return accessibleIds.includes(restaurantId)
  }
}

export default SessionService.getInstance()
