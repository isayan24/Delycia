import { useRouteAccess } from './useRouteAccess'
import { useUserRole } from './useUserRole'
import { usePathname } from '@/hooks/usePathname'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { DEFAULT_ROUTES } from './roleBasedAccess'

interface RouteProtectorProps {
  children: React.ReactNode
  allowedRoles?: number[]
  fallbackRoute?: string
  showAccessDenied?: boolean
}

export function RouteProtector({
  children,
  allowedRoles,
  fallbackRoute,
  showAccessDenied = false,
}: RouteProtectorProps) {
  const { userRole, isLoading } = useUserRole()
  const { canAccessCurrentRoute } = useRouteAccess()
  const navigate = useNavigate()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading || !userRole) return

    // Check if user can access current route
    const hasAccess = allowedRoles
      ? allowedRoles.includes(userRole.id)
      : canAccessCurrentRoute()

    if (!hasAccess) {
      // Redirect to appropriate route based on role
      const redirectRoute = fallbackRoute || DEFAULT_ROUTES[userRole.id] || '/'
      navigate({ to: redirectRoute, replace: true })
    }
  }, [
    userRole,
    isLoading,
    pathname,
    allowedRoles,
    canAccessCurrentRoute,
    navigate,
    fallbackRoute,
  ])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Show access denied if specified
  if (
    !userRole ||
    (!allowedRoles
      ? !canAccessCurrentRoute()
      : !allowedRoles.includes(userRole.id))
  ) {
    if (showAccessDenied) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You dont have permission to access this page.
            </p>
          </div>
        </div>
      )
    }
    return null // Will redirect
  }

  return <>{children}</>
}
