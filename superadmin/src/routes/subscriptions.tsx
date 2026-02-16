import { createFileRoute } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/subscriptions')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: SubscriptionsPage,
})

function SubscriptionsPage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-4">
        <h2 className="text-2xl font-bold">Subscriptions</h2>
        <p className="text-muted-foreground">Subscription management coming soon...</p>
      </div>
    </ProtectedLayout>
  )
}
