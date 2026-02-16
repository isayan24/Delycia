import { createFileRoute } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'
import { StaffList } from '@/components/staff/StaffList'

export const Route = createFileRoute('/staff/')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: StaffPage,
})

function StaffPage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Staff Management</h2>
            <p className="text-muted-foreground">
              Manage staff members across all restaurants
            </p>
          </div>
        </div>

        <StaffList />
      </div>
    </ProtectedLayout>
  )
}
