import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'

/**
 * Orders layout route - applies auth middleware to all /orders/* routes
 */
export const Route = createFileRoute('/orders')({
  beforeLoad: requireAuth,
  component: OrdersLayout,
})

function OrdersLayout() {
  return <Outlet />
}
