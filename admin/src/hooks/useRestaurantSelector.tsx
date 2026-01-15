import { useState, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'
import sessionService from '@/services/sessionService'
import {
  useRestaurantsQuery,
  type Restaurant,
} from './queries/useRestaurantsQuery'

// Custom hook to handle restaurant selection with names
export const useRestaurantSelector = () => {
  const { user, refreshSession } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)

  // Get valid access token
  const token = useMemo(() => {
    // This will be called synchronously, so we need to handle async properly
    return user ? sessionService.getAccessToken() : null
  }, [user])

  // Fetch restaurant details using TanStack Query
  const { data: restaurants = {}, isLoading: isLoadingRestaurants } =
    useRestaurantsQuery(user?.restaurant_rids, token, !!user)

  // Update selected restaurant in session - Enhanced version
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

        // todo Trigger auth state refresh to reflect the changes
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
