import {
  calculateRemainingTime,
  calculateTimeElapsed,
  formatRemainingTime,
} from '@/utils/dateUtils'
import React, { useState, useEffect, useRef, memo } from 'react'

interface ProcessingCountdownDisplayProps {
  orderTime: string
  preparationTime: number
  preparationStartedAt?: string
  isActive?: boolean
  onTimeExpired?: () => void
  className?: string
  renderAs?: 'text' | 'button'
  buttonText?: string
}

interface ProcessingCountdownValue {
  timeElapsed: number
  remainingTime: {
    minutes: number
    seconds: number
    totalSeconds: number
  }
  isExpired: boolean
  formattedRemaining: string
}

/**
 * Optimized countdown display for processing orders that shows remaining preparation time
 * without causing parent component re-renders.
 */
const ProcessingCountdownDisplay: React.FC<ProcessingCountdownDisplayProps> =
  memo(
    ({
      orderTime,
      preparationTime,
      preparationStartedAt,
      isActive = true,
      onTimeExpired,
      className = '',
      renderAs = 'text',
      buttonText = 'Order Ready',
    }) => {
      const [countdown, setCountdown] = useState<ProcessingCountdownValue>(
        () => {
          // Use preparation_started_at if available, otherwise fall back to orderTime
          const startTime = preparationStartedAt || orderTime
          const elapsed = calculateTimeElapsed(startTime)
          const remaining = calculateRemainingTime(
            startTime,
            preparationTime,
            preparationStartedAt,
          )
          return {
            timeElapsed: elapsed,
            remainingTime: remaining,
            isExpired: remaining.totalSeconds <= 0,
            formattedRemaining: formatRemainingTime(remaining),
          }
        },
      )

      const animationFrameRef = useRef<number>(0)
      const lastUpdateRef = useRef<number>(0)
      const expiredCallbackFiredRef = useRef<boolean>(false)
      const isTabVisibleRef = useRef<boolean>(true)

      // Tab visibility detection for performance optimization
      useEffect(() => {
        const handleVisibilityChange = () => {
          isTabVisibleRef.current = !document.hidden
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () =>
          document.removeEventListener(
            'visibilitychange',
            handleVisibilityChange,
          )
      }, [])

      // Optimized countdown update function
      const updateCountdown = () => {
        if (!isActive) return

        const now = Date.now()

        // Update only once per second
        if (now - lastUpdateRef.current >= 1000) {
          // Use preparation_started_at if available, otherwise fall back to orderTime
          const startTime = preparationStartedAt || orderTime
          const elapsed = calculateTimeElapsed(startTime)
          const remaining = calculateRemainingTime(
            startTime,
            preparationTime,
            preparationStartedAt,
          )

          const newCountdownValue: ProcessingCountdownValue = {
            timeElapsed: elapsed,
            remainingTime: remaining,
            isExpired: remaining.totalSeconds <= 0,
            formattedRemaining: formatRemainingTime(remaining),
          }

          setCountdown(newCountdownValue)
          lastUpdateRef.current = now

          // Handle time expiration callback
          if (
            remaining.totalSeconds <= 0 &&
            !expiredCallbackFiredRef.current &&
            onTimeExpired
          ) {
            expiredCallbackFiredRef.current = true
            onTimeExpired()
          }
        }

        // Continue animation loop if component is active
        if (isActive) {
          // Reduce update frequency when tab is not visible
          const delay = isTabVisibleRef.current ? 0 : 5000

          if (delay > 0) {
            setTimeout(() => {
              animationFrameRef.current = requestAnimationFrame(updateCountdown)
            }, delay)
          } else {
            animationFrameRef.current = requestAnimationFrame(updateCountdown)
          }
        }
      }

      // Start countdown animation
      useEffect(() => {
        if (isActive) {
          animationFrameRef.current = requestAnimationFrame(updateCountdown)
        }

        return () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
          }
        }
      }, [isActive, orderTime, preparationTime]) // Only re-run if key props change

      // Cleanup on unmount
      useEffect(() => {
        return () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
          }
        }
      }, [])

      // Reset expired callback when orderTime changes
      useEffect(() => {
        expiredCallbackFiredRef.current = false
      }, [orderTime])

      // Determine styling based on remaining time
      const getCountdownStyles = () => {
        if (countdown.isExpired) {
          return 'text-orange-600 font-bold '
        }
        if (countdown.remainingTime.totalSeconds <= 300) {
          // 5 minutes warning
          return 'text-yellow-600 font-semibold '
        }
        return 'text-green-600 '
      }

      // Render as button (for action buttons)
      if (renderAs === 'button') {
        return (
          <span className="max-[500px]:text-sm text-md">
            {countdown.isExpired
              ? buttonText
              : `${buttonText} (${countdown.formattedRemaining})`}
          </span>
        )
      }

      // Render as text (for status display)
      return (
        <span className={`${getCountdownStyles()} ${className}`}>
          {countdown.isExpired ? 'TIME UP' : countdown.formattedRemaining}
        </span>
      )
    },
  )

ProcessingCountdownDisplay.displayName = 'ProcessingCountdownDisplay'

export default ProcessingCountdownDisplay
