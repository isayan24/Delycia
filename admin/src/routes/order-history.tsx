import { createFileRoute } from '@tanstack/react-router'
import OrderHistoryMain from '@/components/admin/order-history/OrderHistoryMain'

export const Route = createFileRoute('/order-history')({
  component: OrderHistoryPage,
})

function OrderHistoryPage() {
  return (
    <div>
      <OrderHistoryMain />
    </div>
  )
}
