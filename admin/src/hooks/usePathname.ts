// TanStack Router compatibility shim for Next.js hooks
import { useLocation } from '@tanstack/react-router'

/**
 * TanStack Router equivalent of Next.js usePathname
 * Returns the current pathname
 */
export function usePathname(): string {
  const location = useLocation()
  return location.pathname
}

/**
 * Note: For useRouter from Next.js, use:
 * import { useNavigate } from '@tanstack/react-router'
 *
 * const navigate = useNavigate()
 * navigate({ to: '/path' })
 */
