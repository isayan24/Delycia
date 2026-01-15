import { createFileRoute } from '@tanstack/react-router'
import AffiliateDashboard from '@/components/admin/affiliate-dashboard/AffiliateDashboard'

export const Route = createFileRoute('/affiliate')({
  component: AffiliatePage,
})

function AffiliatePage() {
  return (
    <>
      <AffiliateDashboard />
    </>
  )
}
