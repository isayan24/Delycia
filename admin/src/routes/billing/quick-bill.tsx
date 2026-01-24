import { createFileRoute } from '@tanstack/react-router'
import QuickBillMain from '@/components/admin/quick-bill/QuickBillMain'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/billing/quick-bill')({
  beforeLoad: requireAuth,
  component: QuickBillPage,
})

function QuickBillPage() {
  return (
    <div className="h-[calc(100vh-6rem)]">
      <QuickBillMain />
    </div>
  )
}
