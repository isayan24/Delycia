import { createFileRoute } from '@tanstack/react-router'
import QuickBillMain from '@/components/admin/quick-bill/QuickBillMain'

export const Route = createFileRoute('/quick-bill')({
  component: QuickBillPage,
})

function QuickBillPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <QuickBillMain />
    </div>
  )
}
