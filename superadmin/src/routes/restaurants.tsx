import { createFileRoute } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'
import { RestaurantList } from '@/components/restaurants/RestaurantList'
import { useRestaurantsQuery } from '@/hooks/queries/useRestaurantsQuery'

export const Route = createFileRoute('/restaurants')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: RestaurantsPage,
})

function RestaurantsPage() {
  const { data, isLoading, isError, error } = useRestaurantsQuery({
    page: 1,
    limit: 10,
    search: '',
    status: '',
  })

  console.log(data, isLoading, 'data i have')
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
