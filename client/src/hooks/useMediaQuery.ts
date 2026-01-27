import { useState, useEffect } from 'react'

export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState(defaultValue)

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Update matches on change
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)

    // Modern browsers
    media.addEventListener('change', listener)

    // Cleanup
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
