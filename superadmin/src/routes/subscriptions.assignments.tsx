import { createFileRoute } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/subscriptions/assignments')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: SubscriptionAssignmentsPage,
})

function SubscriptionAssignmentsPage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-4">
        <h2 className="text-2xl font-bold">Subscription Assignments</h2>
        <p className="text-muted-foreground">Subscription assignments management coming soon...</p>
      </div>
    </ProtectedLayout>
  )
}
