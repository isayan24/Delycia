import { createFileRoute } from '@tanstack/react-router'
import { ProtectedLayout } from '@/components/protected-layout'
import { requireAuth } from '@/middleware/auth'
import { StaffList } from '@/components/staff/StaffList'

export const Route = createFileRoute('/staff')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth({ context, location })
  },
  component: StaffPage,
})

function StaffPage() {
  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-4">
        <h2 className="text-2xl font-bold">Staff</h2>
        <StaffList />
      </div>
    </ProtectedLayout>
  )
}
