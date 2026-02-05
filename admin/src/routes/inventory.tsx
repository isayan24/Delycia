import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'

/**
 * Inventory layout route - applies auth middleware to all /inventory/* routes
 * This ensures authentication is checked for the index and all child routes
 */
export const Route = createFileRoute('/inventory')({
  beforeLoad: requireAuth,
  component: InventoryLayout,
})

function InventoryLayout() {
  return <Outlet />
}
