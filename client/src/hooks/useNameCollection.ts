/**
 * Name Collection Hook
 * 
 * Custom hook to manage name collection at checkout.
 * Checks if user has a valid name and shows dialog if needed.
 */

import { useState, useCallback } from 'react'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
 
function userNeedsName(user: any): boolean {
  if (!user) return false // Not authenticated - handled elsewhere
  if (!user.name) return true // No name
  if (user.name.trim() === '') return true // Empty name
  return false
}
 
export function useNameCollection() {
  const { user, refreshSession } = useAuthQuery()
  const [showDialog, setShowDialog] = useState(false)
  const [onNameCollectedCallback, setOnNameCollectedCallback] = useState<((name: string) => void) | null>(null)

  const needsName = userNeedsName(user)

  const openDialog = useCallback((callback?: (name: string) => void) => {
    if (callback) {
      setOnNameCollectedCallback(() => callback)
    }
    setShowDialog(true)
  }, [])

  const closeDialog = useCallback(() => {
    setShowDialog(false)
    setOnNameCollectedCallback(null)
  }, [])

  const handleNameCollected = useCallback(async (name: string) => {
    console.log('[useNameCollection] Name collected:', name)
    
    // Refresh user session to get updated data
    await refreshSession()
    
    // Call the callback if provided
    if (onNameCollectedCallback) {
      onNameCollectedCallback(name)
    }
    
    closeDialog()
  }, [onNameCollectedCallback, closeDialog, refreshSession])

  return {
    needsName,
    showDialog,
    openDialog,
    closeDialog,
    handleNameCollected,
    userId: user?._id, // Use id instead of _id to match backend expectations
    user,
  }
}
