import { useState, useRef, useCallback } from 'react'

interface UseLongPressOptions {
  delay?: number
  onLongPress: () => void
  onClick?: () => void
}

interface UseLongPressReturn {
  onMouseDown: () => void
  onMouseUp: () => void
  onMouseLeave: () => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
}

/** Max pixels the finger can move before we consider it a scroll, not a tap */
const MOVE_THRESHOLD = 10

/**
 * Custom hook for detecting long-press (hold) gestures
 * Works with both mouse and touch events.
 * Distinguishes scrolling from intentional taps on touch devices
 * by tracking finger movement against a threshold.
 *
 * @param options - Configuration options
 * @param options.delay - Time in milliseconds to trigger long press (default: 500)
 * @param options.onLongPress - Callback when long press is detected
 * @param options.onClick - Optional callback for regular clicks
 */
export function useLongPress({
  delay = 500,
  onLongPress,
  onClick,
}: UseLongPressOptions): UseLongPressReturn {
  const [isLongPressTriggered, setIsLongPressTriggered] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const isScrollingRef = useRef(false)

  const start = useCallback(() => {
    setIsLongPressTriggered(false)
    isScrollingRef.current = false
    startTimeRef.current = Date.now()

    timerRef.current = setTimeout(() => {
      // Only fire long-press if the finger hasn't moved (not scrolling)
      if (!isScrollingRef.current) {
        setIsLongPressTriggered(true)
        onLongPress()
      }
    }, delay)
  }, [delay, onLongPress])

  const clear = useCallback(
    (shouldTriggerClick = true) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }

      // If it wasn't a long press, wasn't a scroll, and onClick is provided, trigger it
      const pressDuration = Date.now() - startTimeRef.current
      if (
        shouldTriggerClick &&
        !isLongPressTriggered &&
        !isScrollingRef.current &&
        pressDuration < delay &&
        onClick
      ) {
        onClick()
      }

      setIsLongPressTriggered(false)
      touchStartRef.current = null
      isScrollingRef.current = false
    },
    [delay, isLongPressTriggered, onClick],
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
      start()
    },
    [start],
  )

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.touches[0]
    const dx = Math.abs(touch.clientX - touchStartRef.current.x)
    const dy = Math.abs(touch.clientY - touchStartRef.current.y)

    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      // User is scrolling — cancel the long-press timer and mark as scrolling
      isScrollingRef.current = true
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  return {
    onMouseDown: start,
    onMouseUp: () => clear(true),
    onMouseLeave: () => clear(false),
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: () => clear(true),
  }
}

export default useLongPress
