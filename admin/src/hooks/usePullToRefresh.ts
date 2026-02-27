import { useState, useRef, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMediaQuery } from './use-media-query'
import { 
  MOBILE_BREAKPOINT,
  REFRESH_THRESHOLD,
  MAX_PULL_DISTANCE,
  RESISTANCE_FACTOR,
  MIN_LOADING_DURATION,
  ERROR_DISPLAY_DURATION,
  HORIZONTAL_THRESHOLD,
  PULL_ACTIVATION_THRESHOLD
} from '../config/pullToRefresh'

/**
 * State interface for pull-to-refresh functionality
 * Tracks the current state of the pull gesture and refresh operation
 */
export interface PullToRefreshState {
  /** Whether user is currently pulling */
  isPulling: boolean
  /** Current pull distance in pixels (0-150+) */
  pullDistance: number
  /** Whether refresh is in progress */
  isRefreshing: boolean
  /** Whether refresh encountered an error */
  isError: boolean
}

/**
 * Return type for usePullToRefresh hook
 */
export interface UsePullToRefreshReturn {
  /** Current pull-to-refresh state */
  state: PullToRefreshState
  /** Ref to attach to the scroll container element */
  containerRef: React.RefObject<HTMLDivElement | null>
}

/**
 * Custom hook for managing pull-to-refresh functionality
 * Handles gesture detection, state management, and refresh orchestration
 * 
 * @returns {UsePullToRefreshReturn} State and container ref for pull-to-refresh
 */
export function usePullToRefresh(): UsePullToRefreshReturn {
  // Initialize state with useState hooks
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isError, setIsError] = useState(false)

  // Create containerRef with useRef for scroll position detection
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Store touch start coordinates
  const startY = useRef(0)
  const startX = useRef(0)
  
  // Track if touch is active (before activation threshold is met)
  const isTouching = useRef(false)

  // Access Query Client for cache invalidation
  const queryClient = useQueryClient()

  // Detect mobile device using media query with 900px breakpoint
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`)

  // Reset state to idle
  const resetState = useCallback(() => {
    setIsPulling(false)
    setPullDistance(0)
    setIsRefreshing(false)
    setIsError(false)
    isTouching.current = false
  }, [])

  // Trigger refresh operation
  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true)
    const startTime = Date.now()

    try {
      // Invalidate all queries to trigger refetch
      await queryClient.invalidateQueries()

      // Ensure minimum display duration
      const elapsed = Date.now() - startTime
      if (elapsed < MIN_LOADING_DURATION) {
        await new Promise(resolve => 
          setTimeout(resolve, MIN_LOADING_DURATION - elapsed)
        )
      }

      resetState()
    } catch (error) {
      console.error('Pull-to-refresh error:', error)
      setIsError(true)
      
      // Display error for ERROR_DISPLAY_DURATION
      setTimeout(() => resetState(), ERROR_DISPLAY_DURATION)
    }
  }, [queryClient, resetState])

  // Handle touchstart event
  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only activate if on mobile, at scroll position 0, and not already refreshing
    if (!isMobile || isRefreshing) return

    // Check scroll position
    const scrollY = window.scrollY || window.pageYOffset
    if (scrollY > 0) return

    startY.current = e.touches[0].clientY
    startX.current = e.touches[0].clientX
    isTouching.current = true
    // Don't set isPulling yet - wait for activation threshold
  }, [isMobile, isRefreshing])

  // Handle touchmove event
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTouching.current && !isPulling) return

    const currentY = e.touches[0].clientY
    const currentX = e.touches[0].clientX
    const deltaY = currentY - startY.current
    const deltaX = Math.abs(currentX - startX.current)

    // Cancel if horizontal swipe detected
    if (deltaX > HORIZONTAL_THRESHOLD && deltaX > Math.abs(deltaY)) {
      resetState()
      return
    }

    // Only track downward pulls
    if (deltaY > 0) {
      // Activate pulling state only after reaching activation threshold
      if (!isPulling && deltaY >= PULL_ACTIVATION_THRESHOLD) {
        setIsPulling(true)
      }

      // Apply resistance after MAX_PULL_DISTANCE
      const distance = deltaY > MAX_PULL_DISTANCE
        ? MAX_PULL_DISTANCE + (deltaY - MAX_PULL_DISTANCE) * RESISTANCE_FACTOR
        : deltaY

      setPullDistance(distance)
    }
  }, [isPulling, resetState])

  // Handle touchend event
  const handleTouchEnd = useCallback(() => {
    if (!isTouching.current && !isPulling) return

    if (pullDistance >= REFRESH_THRESHOLD) {
      triggerRefresh()
    } else {
      resetState()
    }
  }, [isPulling, pullDistance, triggerRefresh, resetState])

  // Set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Add event listeners with passive option for better scroll performance
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd)

    // Cleanup
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // Cancel gesture on route navigation
  useEffect(() => {
    return () => {
      if (isPulling) {
        resetState()
      }
    }
  }, [isPulling, resetState])

  // Combine state into single object
  const state: PullToRefreshState = {
    isPulling,
    pullDistance,
    isRefreshing,
    isError,
  }

  return {
    state,
    containerRef,
  }
}
