import { createFileRoute } from '@tanstack/react-router'
import AffiliateDashboard from '@/components/admin/affiliate-dashboard/AffiliateDashboard'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/affiliate')({
  beforeLoad: requireAuth,
  component: AffiliatePage,
})

function AffiliatePage() {
  return (
    <>
      <AffiliateDashboard />
    </>
  )
}
