import { createFileRoute } from '@tanstack/react-router'
import Checkout from '@/components/restaurant/checkout/Checkout'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

function CheckoutPage() {
  return (
    <div className="p-5 mx-auto w-fit max-[1000px]:w-full max-[700px]:p-2">
      <Checkout />
    </div>
  )
}
