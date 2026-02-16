import { createFileRoute } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/settings')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-4">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Settings coming soon...</p>
      </div>
    </ProtectedLayout>
  )
}
