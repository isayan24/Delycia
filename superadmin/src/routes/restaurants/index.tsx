import { createFileRoute } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'
import { RestaurantList } from '@/components/restaurants/RestaurantList'

export const Route = createFileRoute('/restaurants/')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: RestaurantsPage,
})

function RestaurantsPage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Restaurants</h2>
            <p className="text-muted-foreground">
              Manage all restaurants on the platform
            </p>
          </div>
        </div>
        <RestaurantList />
      </div>
    </ProtectedLayout>
  )
}
