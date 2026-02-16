import { createFileRoute } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/subscriptions/plans')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: SubscriptionPlansPage,
})

function SubscriptionPlansPage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-4">
        <h2 className="text-2xl font-bold">Subscription Plans</h2>
        <p className="text-muted-foreground">Subscription plans management coming soon...</p>
      </div>
    </ProtectedLayout>
  )
}
