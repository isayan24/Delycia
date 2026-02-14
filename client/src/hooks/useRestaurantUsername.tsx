import { useState, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'

export const useRestaurantUsername = (): string | null => {
  const [username, setUsername] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Use Tanstack Router's useParams to get username from URL if available
  // This is reactive and updates immediately on SPA navigation
  const params = useParams({
    strict: false,
  }) as { username?: string }

  const routeUsername = params.username

  // Initialize from localStorage on mount (client-side only)
  useEffect(() => {
    if (!isInitialized) {
      const storedUsername = localStorage.getItem('currentRestaurantUsername')
      setUsername(routeUsername || storedUsername)
      setIsInitialized(true)
    }
  }, [isInitialized, routeUsername])

  // Update username if route changes
  useEffect(() => {
    if (routeUsername) {
      setUsername(routeUsername)
    }
  }, [routeUsername])

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentRestaurantUsername') {
        // Only override if we're not currently on a specific restaurant route
        if (!routeUsername) {
          setUsername(e.newValue)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [routeUsername])

  return username || routeUsername || null
}
