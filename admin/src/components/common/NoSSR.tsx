import React, { useEffect, useState } from 'react'

interface NoSSRProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Prevents children from rendering on the server.
 * Useful for components that depend on browser APIs (like window or document)
 * to avoid hydration mismatches.
 */
export const NoSSR: React.FC<NoSSRProps> = ({ children, fallback = null }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default NoSSR
