import { useEffect, useState } from 'react'
import roleManager, { RoleData } from './roleManager'
import sessionService from '@/services/sessionService'

/**
 * Hook to get current user role and permissions
 */
export function useUserRole() {
  const [userRole, setUserRole] = useState<RoleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch and update user role
  const fetchUserRole = () => {
    try {
      // Get user data from session service
      const userData = sessionService.getUserData()

      if (userData && userData.role !== undefined) {
        const role = roleManager.getRoleById(userData.role)
        setUserRole(role)
        setError(null)
      } else {
        setUserRole(null)
        setError('No user session found')
      }
    } catch (err) {
      console.error('Failed to get user role:', err)
      setUserRole(null)
      setError('Failed to load user role')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchUserRole()
  }, [])

  // Listen for user data changes in localStorage (e.g., after login)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_data') {
        // User data changed in another tab, re-fetch role
        fetchUserRole()
      }
    }

    // Custom event for same-tab changes
    const handleUserDataChanged = () => {
      fetchUserRole()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener(
      'userDataChanged',
      handleUserDataChanged as EventListener,
    )

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(
        'userDataChanged',
        handleUserDataChanged as EventListener,
      )
    }
  }, [])

  return { userRole, isLoading, error }
}
