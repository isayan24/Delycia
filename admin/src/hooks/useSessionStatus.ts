import { useState, useEffect, useCallback } from 'react'
import {
  sessionEventEmitter,
  SessionErrorEvent,
} from '@/lib/sessionEventEmitter'

export interface SessionStatus {
  isSessionValid: boolean
  sessionError: SessionErrorEvent | null
  clearSessionError: () => void
}

/**
 * Custom hook to detect and manage session expiration state
 *
 * Listens to session error events from TanStack Query and other sources,
 * providing reactive state for session validity and error details.
 */
export function useSessionStatus(): SessionStatus {
  const [sessionError, setSessionError] = useState<SessionErrorEvent | null>(
    null,
  )

  useEffect(() => {
    const handleSessionError = (event: SessionErrorEvent) => {
      // Only update if we don't already have an error (prevent spam)
      setSessionError((currentError) => {
        if (currentError) {
          // Already showing an error, ignore new ones
          return currentError
        }
        return event
      })
    }

    // Subscribe to session error events
    sessionEventEmitter.on(handleSessionError)

    // Cleanup on unmount
    return () => {
      sessionEventEmitter.off(handleSessionError)
    }
  }, [])

  const clearSessionError = useCallback(() => {
    setSessionError(null)
  }, [])

  return {
    isSessionValid: sessionError === null,
    sessionError,
    clearSessionError,
  }
}
