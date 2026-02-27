/**
 * PullToRefreshIndicator Component
 * 
 * Provides visual feedback for pull-to-refresh gestures on mobile devices.
 * Displays pull progress, loading state, and error states with smooth animations.
 * 
 * @requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { motion } from 'motion/react'
import { Loader2, AlertCircle, ArrowDown } from 'lucide-react'
import { REFRESH_THRESHOLD } from '@/config/pullToRefresh'

/**
 * Props interface for the PullToRefreshIndicator component
 */
export interface PullToRefreshIndicatorProps {
  /**
   * Whether the user is currently performing a pull gesture
   */
  isPulling: boolean
  
  /**
   * Current pull distance in pixels (0-200+)
   */
  pullDistance: number
  
  /**
   * Whether a refresh operation is currently in progress
   */
  isRefreshing: boolean
  
  /**
   * Whether the refresh operation encountered an error
   */
  isError: boolean
}

/**
 * Visual indicator component for pull-to-refresh functionality.
 * Renders different states: pulling, ready to refresh, refreshing, and error.
 */
export function PullToRefreshIndicator({
  isPulling,
  pullDistance,
  isRefreshing,
  isError,
}: PullToRefreshIndicatorProps) {
  // Calculate progress percentage (0-1) based on pull distance vs threshold
  const progress = Math.min(pullDistance / REFRESH_THRESHOLD, 1)
  
  // Determine if pull distance has reached the threshold
  const isReady = pullDistance >= REFRESH_THRESHOLD
  
  // Calculate translateY based on pull distance (max 60px down)
  // When idle, position above viewport (-100px)
  const translateY = isPulling || isRefreshing || isError
    ? Math.min(pullDistance * 0.5, 60)
    : -100

  // Calculate opacity: visible when pulling, refreshing, or showing error
  const opacity = isPulling || isRefreshing || isError ? 1 : 0

  // Determine aria-label based on current state
  const ariaLabel = isRefreshing
    ? "Refreshing content"
    : isError
    ? "Refresh failed"
    : isReady
    ? "Release to refresh"
    : "Pull down to refresh"

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-40 flex justify-center"
      style={{ 
        transform: `translateY(${translateY}px)`,
      }}
      animate={{ 
        opacity,
      }}
      initial={{ opacity: 0 }}
      transition={{ 
        opacity: { duration: 0.2 },
      }}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
        {/* Render loading spinner when refresh is in progress */}
        {isRefreshing && (
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        )}
        
        {/* Render error icon when refresh fails */}
        {isError && !isRefreshing && (
          <AlertCircle className="w-6 h-6 text-red-500" />
        )}
        
        {/* Render arrow icon when pulling (not refreshing or error) */}
        {!isRefreshing && !isError && (
          <ArrowDown 
            className="w-6 h-6 text-gray-600 dark:text-gray-300 transition-transform duration-200"
            style={{
              transform: `rotate(${isReady ? 180 : 0}deg)`,
              opacity: progress,
            }}
          />
        )}
      </div>
    </motion.div>
  )
}
