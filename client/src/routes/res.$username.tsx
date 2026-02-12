import { createFileRoute } from '@tanstack/react-router'
import ResLanding from '@/components/all-delycias/ResLanding'

export const Route = createFileRoute('/res/$username')({
  component: RestaurantPage,
})

function RestaurantPage() {
  const { username } = Route.useParams()

  if (!username) {
    return <div>Restaurant not found</div>
  }

  return <ResLanding username={username} />
}
