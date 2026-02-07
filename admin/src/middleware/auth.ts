import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

/**
 * Router context interface for type-safe auth state
 */
export interface RouterContext {
  auth?: {
    isAuthenticated: boolean
    isLoading: boolean
    user: any | null
  }
}

/**
 * Server function to check if user is authenticated
 * This runs on the server and checks the httpOnly cookie
 */
export const checkAuthServer = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const request = getRequest()
      if (!request) {
        return { isAuthenticated: false, user: null }
      }

      // Check for access token in httpOnly cookie
      const accessToken = getAccessTokenFromCookie(request)

      if (!accessToken) {
        return { isAuthenticated: false, user: null }
      }

      // Token exists, user is authenticated
      // For more robust validation, we could also call the backend to verify
      return { isAuthenticated: true, user: null }
    } catch (error) {
      console.error('[checkAuthServer] Error checking auth:', error)
      return { isAuthenticated: false, user: null }
    }
  },
)

/**
 * Middleware function to require authentication
 * Works on both server (SSR) and client
 *
 * Usage in route files:
 * export const Route = createFileRoute('/dashboard')({
 *   beforeLoad: requireAuth,
 *   component: DashboardPage,
 * })
 */
export async function requireAuth({
  location,
}: {
  context?: RouterContext
  location: { href: string }
}) {
  // Check if we're on the server (SSR)
  const isServer = typeof window === 'undefined'

  if (isServer) {
    // On server, use server function to check session via httpOnly cookies
    try {
      const authResult = await checkAuthServer()

      if (!authResult.isAuthenticated) {
        throw redirect({
          to: '/login',
          search: {
            redirect: location.href,
          },
        })
      }

      return {
        showHeader: true,
        showSidebar: true,
        user: authResult.user,
      }
    } catch (error) {
      // If it's a redirect, let it propagate
      if (
        error &&
        typeof error === 'object' &&
        ('to' in error || 'href' in error)
      ) {
        throw error
      }
      // On error, redirect to login
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  }

  // On client, check localStorage (already hydrated)
  // Dynamic import to avoid SSR issues
  const { default: sessionService } = await import('@/services/sessionService')
  const user = sessionService.getUserData()

  if (!user || user.selected_rid === null) {
    throw redirect({
      to: '/login',
      search: {
        redirect: location.href,
      },
    })
  }

  return {
    showHeader: true,
    showSidebar: true,
    user,
  }
}

/**
 * Middleware function to require guest (unauthenticated) access
 * Redirects to /dashboard if user is already authenticated
 */
export function requireGuest({
  search,
}: {
  context?: RouterContext
  search?: { redirect?: string }
}) {
  // On server, allow through - client will handle redirect
  if (typeof window === 'undefined') {
    return {
      showHeader: false,
      showSidebar: false,
    }
  }

  // On client, check localStorage
  const userData = localStorage.getItem('userData')
  const isAuthenticated = !!userData

  if (isAuthenticated) {
    throw redirect({
      to: search?.redirect || '/dashboard',
    })
  }

  return {
    showHeader: false,
    showSidebar: false,
  }
}

/**
 * Helper to check if current route should show UI components
 */
export function shouldShowUIComponents(pathname: string): {
  showHeader: boolean
  showSidebar: boolean
} {
  const publicRoutes = ['/login']
  const isPublicRoute = publicRoutes.includes(pathname)

  return {
    showHeader: !isPublicRoute,
    showSidebar: !isPublicRoute,
  }
}
