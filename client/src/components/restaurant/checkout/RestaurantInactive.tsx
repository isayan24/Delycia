import { Button } from '@/components/ui/button'
import { useRouter } from '@/lib/next-compat'
import { Store, ArrowLeft } from 'lucide-react'

export default function RestaurantInactive() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-6">
      <div className="bg-gray-100 p-6 rounded-full">
        <Store className="w-12 h-12 text-gray-400" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl max-[500px]:text-xl font-bold text-gray-900">
          Restaurant is Currently Offline
        </h1>
        <p className="text-gray-500 max-[500px]:text-xs">
          We are currently not accepting new orders. Please check back later or
          contact the restaurant directly.
        </p>
      </div>

      <Button onClick={() => router.back()} className="mt-4" variant="outline">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Return to Menu
      </Button>
    </div>
  )
}
