import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'

/**
 * Billing layout route - applies auth middleware to all /billing/* routes
 */
export const Route = createFileRoute('/billing')({
  beforeLoad: requireAuth,
  component: BillingLayout,
})

function BillingLayout() {
  return <Outlet />
}
