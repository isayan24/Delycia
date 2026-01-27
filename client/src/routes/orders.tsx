import { createFileRoute } from '@tanstack/react-router'
import UserOrdersPage from '@/components/restaurant/orders/UserOrdersPage'

export const Route = createFileRoute('/orders')({
  component: OrdersPage,
})

function OrdersPage() {
  // get all orders from the database
  return (
    <div className="w-[50rem] mx-auto h-full p-5 max-[800px]:w-full max-[600px]:p-2">
      <UserOrdersPage />
    </div>
  )
}
