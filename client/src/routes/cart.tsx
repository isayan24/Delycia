import { createFileRoute } from '@tanstack/react-router'
import FoodCart from '@/components/restaurant/cart/FoodCart'

export const Route = createFileRoute('/cart')({
  component: Cart,
})

function Cart() {
  return (
    <div className="p-10 mx-auto w-fit max-[700px]:w-full max-[700px]:p-2">
      <FoodCart />
    </div>
  )
}
