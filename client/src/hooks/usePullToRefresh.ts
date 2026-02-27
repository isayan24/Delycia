import { useState, useRef, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouterState } from '@tanstack/react-router'
import { useMediaQuery } from './useMediaQuery'
import { 
  MOBILE_BREAKPOINT, 
  HORIZONTAL_THRESHOLD, 
  MAX_PULL_DISTANCE, 
  RESISTANCE_FACTOR,
  REFRESH_THRESHOLD,
  MIN_LOADING_DURATION,
  ERROR_DISPLAY_DURATION,
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
  const containerRef = useRef<HTMLDivElement>(null)

  // Refs to store touch coordinates across event handlers
  const startY = useRef<number>(0)
  const startX = useRef<number>(0)
  
  // Track if touch is active (before activation threshold is met)
  const isTouching = useRef<boolean>(false)

  // Access Query Client for cache invalidation
  const queryClient = useQueryClient()

  // Detect mobile device using media query with 900px breakpoint
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`)

  // Track current route location to detect navigation
  const location = useRouterState({
    select: (state) => state.location,
  })

  /**
   * Handle touchstart event
   * Checks conditions before enabling the pull gesture:
   * - Must be on mobile device
   * - Scroll position must be 0
   * - Must not already be refreshing
   * 
   * @requirement 1.2 - Enable gesture detection when scroll position is 0
   * @requirement 1.3 - Disable gesture detection when scroll position > 0
   * @requirement 4.4 - Ignore new refresh requests while refreshing
   * @requirement 6.1 - Check scroll position before enabling
   */
  const handleTouchStart = (e: TouchEvent) => {
    // Check if on mobile device
    if (!isMobile) return

    // Check if already refreshing
    if (isRefreshing) return

    // Check scroll position - must be at top (0)
    const scrollY = window.scrollY || window.pageYOffset
    if (scrollY > 0) return

    // Store initial touch coordinates
    startY.current = e.touches[0].clientY
    startX.current = e.touches[0].clientX

    // Mark as touching but don't activate pulling yet
    isTouching.current = true
  }

  /**
   * Handle touchmove event
   * Calculates pull distance and applies resistance after MAX_PULL_DISTANCE.
   * Cancels gesture if horizontal movement exceeds HORIZONTAL_THRESHOLD.
   * 
   * @requirement 1.1 - Track vertical distance of the gesture
   * @requirement 6.2 - Do not activate on horizontal swipe
   * @requirement 6.3 - Cancel pull gesture on horizontal scroll
   * @requirement 9.2 - Allow maximum pull distance of 200px before resistance
   * @requirement 9.3 - Apply resistance to pulling beyond 200px
   */
  const handleTouchMove = (e: TouchEvent) => {
    // Only process if touch is active
    if (!isTouching.current && !isPulling) return

    // Get current touch coordinates
    const currentY = e.touches[0].clientY
    const currentX = e.touches[0].clientX

    // Calculate deltas from start position
    const deltaY = currentY - startY.current
    const deltaX = Math.abs(currentX - startX.current)

    // Cancel gesture if horizontal movement exceeds threshold
    // and is greater than vertical movement (horizontal swipe detected)
    if (deltaX > HORIZONTAL_THRESHOLD && deltaX > Math.abs(deltaY)) {
      setIsPulling(false)
      setPullDistance(0)
      isTouching.current = false
      return
    }

    // Only track downward pulls (deltaY > 0)
    if (deltaY > 0) {
      // Activate pulling state only after reaching activation threshold
      if (!isPulling && deltaY >= PULL_ACTIVATION_THRESHOLD) {
        setIsPulling(true)
      }

      // Apply resistance after MAX_PULL_DISTANCE
      let distance: number
      if (deltaY > MAX_PULL_DISTANCE) {
        // Beyond max distance: apply resistance factor
        distance = MAX_PULL_DISTANCE + (deltaY - MAX_PULL_DISTANCE) * RESISTANCE_FACTOR
      } else {
        // Within max distance: track directly
        distance = deltaY
      }

      // Update pull distance state
      setPullDistance(distance)
    }
  }

  /**
   * Handle touchend event
   * Checks if pull distance meets the threshold to trigger refresh.
   * If threshold is met, triggers refresh; otherwise resets state to idle.
   * 
   * @requirement 1.4 - Trigger refresh when pull distance exceeds threshold
   * @requirement 1.5 - Cancel gesture without refresh when below threshold
   */
  const handleTouchEnd = () => {
    // Only process if touch is active
    if (!isTouching.current && !isPulling) return

    // Check if pull distance meets or exceeds the refresh threshold
    if (pullDistance >= REFRESH_THRESHOLD) {
      // Threshold met - trigger refresh
      triggerRefresh()
    } else {
      // Threshold not met - reset state to idle
      setIsPulling(false)
      setPullDistance(0)
      isTouching.current = false
    }
  }

  /**
   * Trigger refresh operation
   * Sets isRefreshing state, invalidates all queries, ensures minimum display duration,
   * and handles errors by setting isError state.
   * 
   * @requirement 4.1 - Invalidate all queries in Query Client cache
   * @requirement 4.3 - Hide indicator after queries complete
   * @requirement 5.1 - Transition to loading state when refresh triggered
   * @requirement 5.3 - Animate out and hide after completion
   * @requirement 5.4 - Display error state for 2 seconds on failure
   * @requirement 5.5 - Remain visible for minimum 500ms
   * @requirement 9.4 - Minimum display duration of 500ms
   * @requirement 9.5 - Error display duration of 2000ms
   */
  const triggerRefresh = async () => {
    // Set refreshing state and reset pull state
    setIsPulling(false)
    setPullDistance(0)
    setIsRefreshing(true)
    isTouching.current = false
    
    // Record start time for minimum display duration
    const startTime = Date.now()
    
    try {
      // Invalidate all queries in the Query Client cache
      await queryClient.invalidateQueries()
      
      // Calculate elapsed time
      const elapsed = Date.now() - startTime
      
      // Ensure minimum display duration of 500ms
      if (elapsed < MIN_LOADING_DURATION) {
        await new Promise(resolve => setTimeout(resolve, MIN_LOADING_DURATION - elapsed))
      }
      
      // Reset to idle state after successful completion
      setIsRefreshing(false)
    } catch (error) {
      // Handle errors by setting error state
      setIsRefreshing(false)
      setIsError(true)
      
      // Display error for 2000ms before resetting
      setTimeout(() => {
        setIsError(false)
      }, ERROR_DISPLAY_DURATION)
    }
  }

  /**
   * Set up event listeners with useEffect
   * Attaches touch event handlers to window object with appropriate options.
   * Uses passive listeners for touchstart and touchmove to improve scroll performance.
   * Cleans up all listeners on unmount.
   * 
   * @requirement 8.1 - Respond to touch events within 16ms (60fps)
   * @requirement 8.3 - Use passive event listeners to improve scroll performance
   */
  useEffect(() => {
    // Add touchstart listener with passive: true option
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    
    // Add touchmove listener with passive: true option
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    
    // Add touchend listener (no passive option needed)
    window.addEventListener('touchend', handleTouchEnd)
    
    // Return cleanup function to remove all listeners
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPulling, pullDistance, isRefreshing, isMobile]) // Dependencies for handler closures

  /**
   * Cancel active gesture on route navigation
   * Detects route changes and resets pull state to prevent gesture from
   * persisting across page transitions.
   * 
   * @requirement 7.3 - Cancel gesture when route transition occurs during active pull
   */
  useEffect(() => {
    // If currently pulling when route changes, cancel the gesture
    if (isPulling) {
      setIsPulling(false)
      setPullDistance(0)
    }
  }, [location]) // Trigger when location changes

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
