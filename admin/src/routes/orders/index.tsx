import { createFileRoute } from '@tanstack/react-router'
import { OrdersMain } from '@/components/admin/orders'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/orders/')({
  beforeLoad: requireAuth,
  component: OrdersPage,
})

function OrdersPage() {
  return (
    <div>
      <OrdersMain />
    </div>
  )
}
