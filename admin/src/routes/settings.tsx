import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'

/**
 * Settings layout route - applies auth middleware to all /settings/* routes
 */
export const Route = createFileRoute('/settings')({
  beforeLoad: requireAuth,
  component: SettingsLayout,
})

function SettingsLayout() {
  return <Outlet />
}
