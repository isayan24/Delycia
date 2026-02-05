import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'

/**
 * Users layout route - applies auth middleware to all /users/* routes
 */
export const Route = createFileRoute('/users')({
  beforeLoad: requireAuth,
  component: UsersLayout,
})

function UsersLayout() {
  return <Outlet />
}
