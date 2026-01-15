import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import sessionService from '@/services/sessionService'

/**
 * Hook for managing restaurant session state (switching restaurants, updating user details)
 * Separated from data fetching concerns which are handled by query hooks
 */
export const useRestaurantSession = () => {
  const { refreshSession } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)

  /**
   * Update selected restaurant in session
   */
  const updateSelectedRestaurant = useCallback(
    async (selectedRid: string) => {
      setIsUpdating(true)
      try {
        // Convert string back to number for session storage
        const ridNumber = parseInt(selectedRid)

        // Validate that the restaurant ID is accessible
        if (!sessionService.isRestaurantAccessible(ridNumber)) {
          throw new Error(
            `Restaurant ID ${ridNumber} is not accessible to current user`,
          )
        }

        // Update session using the new updateUserDetails function
        const updateSuccess = sessionService.updateSelectedRestaurant(ridNumber)

        if (!updateSuccess) {
          throw new Error('Failed to update selected restaurant in session')
        }

        // Trigger auth state refresh to reflect the changes
        refreshSession()
        window.location.reload()
      } catch (error) {
        console.error('Failed to update selected restaurant:', error)
        // You could add a toast notification here if needed
      } finally {
        setIsUpdating(false)
      }
    },
    [refreshSession],
  )

  /**
   * Bulk update user details function
   */
  const updateUserDetails = useCallback(
    async (updates: {
      selected_rid?: number
      restaurant_rids?: number[]
      role?: number
      phone_number?: string
    }) => {
      setIsUpdating(true)
      try {
        const updateSuccess = sessionService.updateUserDetails(updates)

        if (!updateSuccess) {
          throw new Error('Failed to update user details in session')
        }

        // Trigger auth state refresh to reflect the changes
        refreshSession()

        return true
      } catch (error) {
        console.error('Failed to update user details:', error)
        return false
      } finally {
        setIsUpdating(false)
      }
    },
    [refreshSession],
  )

  return {
    updateSelectedRestaurant,
    updateUserDetails,
    isUpdating,
  }
}
