'use client'

import { useEffect } from 'react'

/**
 * Hook to handle mobile keyboard layout shifts and the "white space" bug.
 * It sets a global --vh CSS variable for the visual viewport height.
 */
export function useMobileViewport() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return

    const handleResize = () => {
      // Set a CSS variable for the actual visible height
      const vh = window.visualViewport?.height || window.innerHeight
      document.documentElement.style.setProperty('--vh', `${vh}px`)

      // If the keyboard is closed (viewport height returns to normal),
      // forcefully scroll to top to kill the blank space bug
      if (vh > window.innerHeight * 0.8) {
        window.scrollTo(0, 0)
      }
    }

    // Initial check
    handleResize()

    window.visualViewport.addEventListener('resize', handleResize)
    window.visualViewport.addEventListener('scroll', handleResize)
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('scroll', handleResize)
    }
  }, [])
}
