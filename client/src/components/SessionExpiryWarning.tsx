import { useEffect, useState } from 'react'
import { useSessionStatus } from '../hooks/useSessionStatus'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { AlertCircle, Clock, LogOut } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'

/**
 * Format seconds into human-readable time
 */
function formatTime(seconds: number): string {
  if (seconds <= 0) return '0:00'
  
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Session Expiry Warning Component
 * 
 * Shows a modal warning when session is about to expire (5 minutes before).
 * Displays countdown timer and allows user to extend session or logout.
 * 
 * Features:
 * - Automatic warning at 5 minutes before expiry
 * - Live countdown timer
 * - "Stay Logged In" button to extend session
 * - "Logout" button for manual logout
 * - Auto-logout when session expires
 * - Dismissible (but reappears if not extended)
 * 
 * Usage:
 * ```tsx
 * // Add to your root layout or app component
 * <SessionExpiryWarning />
 * ```
 */
export function SessionExpiryWarning() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const {
    shouldShowWarning,
    timeUntilExpiry,
    isExpired,
    extendSession,
    extending,
  } = useSessionStatus({
    onWarning: () => {
      setIsOpen(true)
    },
    onExpired: () => {
      // Session expired - redirect to login
      handleLogout()
    },
  })

  // Update countdown every second
  useEffect(() => {
    if (!shouldShowWarning || !timeUntilExpiry) {
      setCountdown(0)
      return
    }

    setCountdown(timeUntilExpiry)

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [shouldShowWarning, timeUntilExpiry])

  // Show modal when warning is triggered
  useEffect(() => {
    if (shouldShowWarning) {
      setIsOpen(true)
    }
  }, [shouldShowWarning])

  // Handle session extension
  const handleExtend = async () => {
    const success = await extendSession()
    if (success) {
      setIsOpen(false)
      setCountdown(0)
    }
  }

  // Handle logout
  const handleLogout = () => {
    setIsOpen(false)
    // Clear cookies and redirect to home
    document.cookie = 'access_token=; Max-Age=0; path=/'
    document.cookie = 'refresh_token=; Max-Age=0; path=/'
    router.navigate({ to: '/' })
  }

  // Handle modal close (user can dismiss, but it will reappear)
  const handleClose = () => {
    setIsOpen(false)
  }

  // Don't render if session expired (logout will handle redirect)
  if (isExpired) {
    return null
  }

  // Don't render if no warning needed
  if (!shouldShowWarning) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Session Expiring Soon</DialogTitle>
          </div>
          <DialogDescription>
            Your session will expire soon due to inactivity. Would you like to stay logged in?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6">
          <Clock className="h-12 w-12 text-amber-500 mb-4" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Time remaining</p>
            <p className="text-4xl font-bold font-mono tabular-nums">
              {formatTime(countdown)}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <Button
            onClick={handleExtend}
            disabled={extending}
            className="w-full sm:w-auto"
          >
            {extending ? 'Extending...' : 'Stay Logged In'}
          </Button>
        </DialogFooter>

        <div className="text-xs text-center text-muted-foreground mt-2">
          <button
            onClick={handleClose}
            className="hover:underline"
          >
            Remind me later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
