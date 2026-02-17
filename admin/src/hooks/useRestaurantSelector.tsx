import { useState, useCallback } from 'react'
import { useAdminAuthQuery } from './queries/useAdminAuthQuery'
import sessionService from '@/services/sessionService'
import {
  useRestaurantsQuery,
  type Restaurant,
} from './queries/useRestaurantsQuery'
import useToast from './UseToast'

// Custom hook to handle restaurant selection with names
export const useRestaurantSelector = () => {
  const { user, refreshSession } = useAdminAuthQuery()
  const [isUpdating, setIsUpdating] = useState(false)

  const { showError } = useToast()

  // Fetch restaurant details using TanStack Query
  // No token needed - axios automatically includes httpOnly cookies
  const { data: restaurants = {}, isLoading: isLoadingRestaurants } =
    useRestaurantsQuery(user?.restaurant_rids, !!user)

  // Update selected restaurant in session - Enhanced version with TanStack Query
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

        // Refresh auth state to update the user object
        await refreshSession()

        window.location.reload()
      } catch (error) {
        console.error('Failed to update selected restaurant:', error)
        showError('Error', 'Failed to update selected restaurant')
      } finally {
        setIsUpdating(false)
      }
    },
    [refreshSession],
  )

  // Bulk update user details function
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

        // todo Trigger auth state refresh to reflect the changes
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

  const getRestaurantName = useCallback(
    (rid: string): string => {
      return restaurants[rid]?.name || `Restaurant ${rid}`
    },
    [restaurants],
  )

  const getSelectedRestaurant = useCallback((): Restaurant | null => {
    if (!user?.selected_rid) return null
    const selectedRidString = user.selected_rid.toString()
    return restaurants[selectedRidString] || null
  }, [user?.selected_rid, restaurants])

  const getAllRestaurants = useCallback((): Restaurant[] => {
    if (!user?.restaurant_rids) return []

    return user.restaurant_rids.map((rid: number) => {
      const ridString = rid.toString()
      return (
        restaurants[ridString] || {
          id: ridString,
          name: `Restaurant ${ridString}`,
        }
      )
    })
  }, [user?.restaurant_rids, restaurants])

  // Additional utility functions
  const isRestaurantAccessible = useCallback((rid: number): boolean => {
    return sessionService.isRestaurantAccessible(rid)
  }, [])

  const getAccessibleRestaurantIds = useCallback((): number[] => {
    return sessionService.getAccessibleRestaurantIds()
  }, [])

  return {
    selectedRid: user?.selected_rid?.toString(),
    restaurantRids: user?.restaurant_rids || [],
    restaurants,
    selectedRestaurant: getSelectedRestaurant(),
    allRestaurants: getAllRestaurants(),
    updateSelectedRestaurant,
    updateUserDetails, // New function for bulk updates
    getRestaurantName,
    isUpdating,
    isLoadingRestaurants,
    isRestaurantAccessible,
    getAccessibleRestaurantIds,
  }
}
