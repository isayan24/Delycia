import { redirect } from '@tanstack/react-router'
import sessionService from '@/services/sessionService'

/**
 * Router context interface for type-safe auth state
 * Note: Currently not used for auth checks, but kept for future enhancements
 */
export interface RouterContext {
  auth?: {
    isAuthenticated: boolean
    isLoading: boolean
    user: any | null
  }
}

/**
 * Middleware function to require authentication
 * Redirects to /login if user is not authenticated
 *
 * Usage:
 * export const Route = createFileRoute('/dashboard')({
 *   beforeLoad: requireAuth,
 *   component: DashboardPage,
 * })
 */
export function requireAuth({
  location,
}: {
  context?: RouterContext
  location: { href: string }
}) {
  // Get auth state directly from sessionService (synchronous)
  const user = sessionService.getUserData()
  const isAuthenticated = !!user

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    throw redirect({
      to: '/login',
      search: {
        redirect: location.href,
      },
    })
  }

  // Return metadata for layout control
  return {
    showHeader: true,
    showSidebar: true,
  }
}

/**
 * Middleware function to require guest (unauthenticated) access
 * Redirects to /dashboard if user is already authenticated
 *
 * Usage:
 * export const Route = createFileRoute('/login')({
 *   beforeLoad: requireGuest,
 *   component: LoginPage,
 * })
 */
export function requireGuest({
  search,
}: {
  context?: RouterContext
  search?: { redirect?: string }
}) {
  // Get auth state directly from sessionService (synchronous)
  const user = sessionService.getUserData()
  const isAuthenticated = !!user

  // If authenticated, redirect to dashboard or the intended destination
  if (isAuthenticated) {
    throw redirect({
      to: search?.redirect || '/dashboard',
    })
  }

  // Return metadata for layout control
  return {
    showHeader: false,
    showSidebar: false,
  }
}

/**
 * Helper to check if current route should show UI components
 * This is used in the root layout to conditionally render header/sidebar
 */
export function shouldShowUIComponents(pathname: string): {
  showHeader: boolean
  showSidebar: boolean
} {
  // List of public routes that shouldn't show header/sidebar
  const publicRoutes = ['/login']

  const isPublicRoute = publicRoutes.includes(pathname)

  return {
    showHeader: !isPublicRoute,
    showSidebar: !isPublicRoute,
  }
}
