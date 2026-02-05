import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'

/**
 * Reports layout route - applies auth middleware to all /reports/* routes
 */
export const Route = createFileRoute('/reports')({
  beforeLoad: requireAuth,
  component: ReportsLayout,
})

function ReportsLayout() {
  return <Outlet />
}
