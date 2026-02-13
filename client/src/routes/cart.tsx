import { createFileRoute } from '@tanstack/react-router'
import FoodCart from '@/components/restaurant/cart/FoodCart'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from '@/lib/next-compat'

export const Route = createFileRoute('/cart')({
  component: Cart,
})

function Cart() {
  const router = useRouter()
  return (
    <div className="p-10 mx-auto w-[45rem] max-[1000px]:w-full max-[1100px]:p-6">
      <Button
        variant="ghost"
        type="button"
        className="w-fit p-0 h-auto text-gray-400 hover:bg-transparent hover:text-orange-600 transition-colors group"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-2 transition-transform group-hover:-translate-x-1" />
        <span className="text-xs font-bold uppercase tracking-widest">
          Back to Orders
        </span>
      </Button>
      <FoodCart />
    </div>
  )
}
