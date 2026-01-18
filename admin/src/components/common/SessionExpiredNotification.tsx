import React, { useEffect, useState } from 'react'
import { useSessionStatus } from '@/hooks/useSessionStatus'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, RotateCcw, ShieldAlert } from 'lucide-react'

export const SessionExpiredNotification: React.FC = () => {
  const { sessionError, clearSessionError } = useSessionStatus()
  const { logout } = useAuth()
  const [show, setShow] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Show notification when there's a session error
    if (sessionError) {
      setShow(true)
    } else {
      setShow(false)
    }
  }, [sessionError])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    clearSessionError()
    await logout()
    // Logout redirects to /login, so no need to do anything else
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    clearSessionError()
    window.location.reload()
  }

  if (!show || !sessionError) return null

  // Determine message and action based on error type
  const getMessage = () => {
    switch (sessionError.type) {
      case 'SESSION_EXPIRED':
        return 'Your session has expired'
      case 'IDLE_TOO_LONG':
        return "You've been idle for too long"
      case 'UNAUTHORIZED':
        return 'Authentication failed'
      default:
        return 'Session error occurred'
    }
  }

  // Show logout button for expired/unauthorized, refresh for idle
  const showLogout = sessionError.type !== 'IDLE_TOO_LONG'
  const showRefresh = sessionError.type === 'IDLE_TOO_LONG'

  return (
    <div
      className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-9999 transition-all duration-300 ease-in-out ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="bg-white border border-orange-200 rounded-full shadow-lg px-6 py-3 flex items-center space-x-4 animate-in slide-in-from-top-4 duration-300">
        <div className="flex items-center space-x-2 text-orange-600">
          <ShieldAlert className="w-5 h-5" />
          <span className="font-medium text-sm">{getMessage()}</span>
        </div>

        <div className="h-4 w-px bg-gray-200 mx-2" />

        {showLogout && (
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <LogOut
              className={`w-4 h-4 ${isLoggingOut ? 'animate-spin' : ''}`}
            />
            <span>Logout</span>
          </button>
        )}

        {showRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RotateCcw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default SessionExpiredNotification
