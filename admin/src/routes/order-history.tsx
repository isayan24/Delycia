import { createFileRoute } from '@tanstack/react-router'
import OrderHistoryMain from '@/components/admin/order-history/OrderHistoryMain'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/order-history')({
  beforeLoad: requireAuth,
  component: OrderHistoryPage,
})

function OrderHistoryPage() {
  return (
    <div>
      <OrderHistoryMain />
    </div>
  )
}
