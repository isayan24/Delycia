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
  onTouchStart: () => void
  onTouchEnd: () => void
}

/**
 * Custom hook for detecting long-press (hold) gestures
 * Works with both mouse and touch events
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

  const start = useCallback(() => {
    setIsLongPressTriggered(false)
    startTimeRef.current = Date.now()

    timerRef.current = setTimeout(() => {
      setIsLongPressTriggered(true)
      onLongPress()
    }, delay)
  }, [delay, onLongPress])

  const clear = useCallback(
    (shouldTriggerClick = true) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }

      // If it wasn't a long press and onClick is provided, trigger it
      const pressDuration = Date.now() - startTimeRef.current
      if (
        shouldTriggerClick &&
        !isLongPressTriggered &&
        pressDuration < delay &&
        onClick
      ) {
        onClick()
      }

      setIsLongPressTriggered(false)
    },
    [delay, isLongPressTriggered, onClick],
  )

  return {
    onMouseDown: start,
    onMouseUp: () => clear(true),
    onMouseLeave: () => clear(false),
    onTouchStart: start,
    onTouchEnd: () => clear(true),
  }
}

export default useLongPress
