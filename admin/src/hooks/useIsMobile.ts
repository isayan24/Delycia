import { useState, useEffect } from 'react'

/**
 * Hook to detect if the current screen size is mobile (< 768px)
 * Uses the same breakpoint as Tailwind's 'md' breakpoint
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check on mount
    checkIsMobile()

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return isMobile
}