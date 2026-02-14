import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { getAccessTokenFromCookie, parseCookies } from '@/lib/server-cookies'

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
 * Server function to check if user is authenticated.
 * Checks httpOnly cookies — first the access token, then attempts
 * refresh via the refresh token if access token is missing/expired.
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

      if (accessToken) {
        // Access token exists — consider authenticated
        // (The session endpoint will handle deep validation + refresh if needed)
        return { isAuthenticated: true, user: null }
      }

      // No access token — check if refresh token exists
      // If it does, the user's session can be recovered
      const cookieHeader = request.headers.get('cookie')
      const cookies = parseCookies(cookieHeader)
      const refreshToken = cookies['admin_refresh_token']

      if (refreshToken) {
        // Refresh token exists — the session endpoint will auto-refresh
        // Let the user through; the client-side useAdminAuthQuery will
        // call /api/auth/session which handles the refresh transparently
        return { isAuthenticated: true, user: null }
      }

      // No tokens at all — not authenticated
      return { isAuthenticated: false, user: null }
    } catch (error) {
      console.error('[checkAuthServer] Error checking auth:', error)
      return { isAuthenticated: false, user: null }
    }
  },
)

/**
 * Server function to check if user has any valid tokens (for guest guard).
 * Returns true if either access token or refresh token exists.
 */
export const checkHasTokensServer = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const request = getRequest()
      if (!request) {
        return { hasTokens: false }
      }

      const cookieHeader = request.headers.get('cookie')
      const cookies = parseCookies(cookieHeader)

      const hasAccessToken = !!cookies['admin_access_token']
      const hasRefreshToken = !!cookies['admin_refresh_token']

      return { hasTokens: hasAccessToken || hasRefreshToken }
    } catch (error) {
      console.error('[checkHasTokensServer] Error:', error)
      return { hasTokens: false }
    }
  },
)

/**
 * Middleware function to require authentication.
 * Works on both server (SSR) and client.
 *
 * IMPORTANT: This checks authentication status only — NOT business logic
 * like whether a restaurant is selected. That's handled by the page component.
 */
export async function requireAuth({
  location,
}: {
  context?: RouterContext
  location: { href: string }
}) {
  const isServer = typeof window === 'undefined'

  if (isServer) {
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

  // ─── Client-side check ───
  // Check localStorage for user data. Note: we do NOT check selected_rid here.
  // Authentication ≠ restaurant selection. If the user is logged in but has
  // no selected_rid, we let them through and the page component handles it.
  const { default: sessionService } = await import('@/services/sessionService')
  const user = sessionService.getUserData()

  if (!user) {
    // No localStorage data — this could be a race condition where the
    // session endpoint hasn't populated localStorage yet. Don't redirect
    // immediately; let the page component and useAdminAuthQuery handle it.
    // Only redirect if we're sure there's no session at all.

    // Check if we might have tokens (access or refresh) that could recover the session
    // On client side, we can't read httpOnly cookies, so we rely on a quick check
    try {
      const hasTokens = await checkHasTokensServer()
      if (hasTokens.hasTokens) {
        // Tokens exist — let the page load. useAdminAuthQuery will call
        // /api/auth/session which auto-refreshes and populates localStorage.
        return {
          showHeader: true,
          showSidebar: true,
          user: null,
        }
      }
    } catch {
      // If the server check fails, fall through to redirect
    }

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
 * Middleware function to require guest (unauthenticated) access.
 * Redirects to /dashboard if user is already authenticated.
 *
 * Checks both server-side tokens (httpOnly cookies) and client-side
 * localStorage to prevent showing login page to authenticated users.
 */
export async function requireGuest({
  search,
}: {
  context?: RouterContext
  search?: { redirect?: string }
}) {
  const isServer = typeof window === 'undefined'

  if (isServer) {
    // On server, check if any tokens exist
    try {
      const result = await checkHasTokensServer()
      if (result.hasTokens) {
        // User has tokens — redirect away from login page
        throw redirect({
          to: search?.redirect || '/dashboard',
        })
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
      // On error during check, allow through to login page
    }

    return {
      showHeader: false,
      showSidebar: false,
    }
  }

  // ─── Client-side check ───
  // Check localStorage with the correct key
  const userData = localStorage.getItem('admin_user_data')

  if (userData) {
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
