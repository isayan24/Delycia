import { createFileRoute } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/support')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: SupportPage,
})

function SupportPage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-4">
        <h2 className="text-2xl font-bold">Support</h2>
        <p className="text-muted-foreground">Support resources coming soon...</p>
      </div>
    </ProtectedLayout>
  )
}
