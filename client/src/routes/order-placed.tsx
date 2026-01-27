import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle } from 'lucide-react'

export const Route = createFileRoute('/order-placed')({
  component: OrderPlacedPage,
})

function OrderPlacedPage() {
  // TODO: CLear the cart if order placed

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <CheckCircle className="h-24 w-24 text-green-500" />
      <h1 className="text-2xl font-bold mt-4">Your order has been placed!</h1>
      <Link to="/orders" className="text-blue-500 mt-2">
        Go to your orders
      </Link>
    </div>
  )
}
