'use client'

import { useState, useRef } from 'react'
import { useScroll, useMotionValueEvent } from 'motion/react'

/**
 * Hook to detect scroll direction and determine if a component should be hidden.
 * @param threshold - Minimum scroll distance before triggering a change.
 * @param offset - Initial scroll offset before hiding is allowed (e.g., don't hide at the very top).
 */
export function useScrollHide(threshold = 10, offset = 50) {
  const { scrollY } = useScroll()
  const [isHidden, setIsHidden] = useState(false)
  const lastScrollY = useRef(0)

  useMotionValueEvent(scrollY, 'change', (latest: number) => {
    const diff = latest - lastScrollY.current

    // Only trigger if we've scrolled more than the threshold
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && latest > offset) {
        // Scrolling Down - Hide
        setIsHidden(true)
      } else {
        // Scrolling Up - Show
        setIsHidden(false)
      }
      lastScrollY.current = latest
    }
  })

  return isHidden
}
