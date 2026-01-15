import { createFileRoute } from '@tanstack/react-router'
import { OrdersMain } from '@/components/admin/orders'

export const Route = createFileRoute('/orders')({
  component: OrdersPage,
})

function OrdersPage() {
  return (
    <div>
      <OrdersMain />
    </div>
  )
}
