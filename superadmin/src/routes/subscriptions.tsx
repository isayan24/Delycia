import {
  createFileRoute,
  Outlet,
  Navigate,
  useLocation,
} from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/subscriptions')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: SubscriptionsLayout,
})

function SubscriptionsLayout() {
  const location = useLocation()

  // If user navigates to exact /subscriptions, redirect to /subscriptions/plans
  if (location.pathname === '/subscriptions') {
    return <Navigate to="/subscriptions/plans" />
  }

  // Render child routes via Outlet
  return <Outlet />
}
