import { createFileRoute } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'
import { UserList } from '@/components/users/UserList'

export const Route = createFileRoute('/users/')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: UsersPage,
})

function UsersPage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Users</h2>
            <p className="text-muted-foreground">
              Manage all users across all restaurants
            </p>
          </div>
        </div>
        <UserList />
      </div>
    </ProtectedLayout>
  )
}
