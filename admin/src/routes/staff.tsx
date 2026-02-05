import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'

/**
 * Staff layout route - applies auth middleware to all /staff/* routes
 */
export const Route = createFileRoute('/staff')({
  beforeLoad: requireAuth,
  component: StaffLayout,
})

function StaffLayout() {
  return <Outlet />
}
