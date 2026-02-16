import { createFileRoute } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/users')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: UsersPage,
})

function UsersPage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-4">
        <h2 className="text-2xl font-bold">Users</h2>
        <p className="text-muted-foreground">User management coming soon...</p>
      </div>
    </ProtectedLayout>
  )
}
