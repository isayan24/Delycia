'use client'

import { ReactNode } from 'react'

/**
 * AuthProvider Component
 *
 * This is now a simple wrapper that just passes through children.
 * The actual auth logic is in useAuthQuery hook which components use directly.
 *
 * This component is kept for backward compatibility with __root.tsx layout.
 * You can safely remove this wrapper if you prefer.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

// Re-export the hook for convenience
export { useAuthQuery } from '@/hooks/queries/useAuthQuery'
