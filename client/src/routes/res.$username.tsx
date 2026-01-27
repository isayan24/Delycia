import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import ResLanding from '@/components/all-delycias/ResLanding'

const searchSchema = z.object({
  id: z.number().optional(),
})

export const Route = createFileRoute('/res/$username')({
  validateSearch: searchSchema,
  component: RestaurantPage,
})

function RestaurantPage() {
  const { username } = Route.useParams()
  const { id } = Route.useSearch()

  // You can use either username or ID to fetch
  const identifier = username || id

  if (!identifier) {
    return <div>Restaurant identifier not found</div>
  }

  return <ResLanding rid={id} rname={username} />
}
