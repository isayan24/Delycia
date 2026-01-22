import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'
import { StaffList } from '@/components/admin/staff/StaffList'
import { CreateStaffDialog } from '@/components/admin/staff/CreateStaffDialog'
import { Users2 } from 'lucide-react'

export const Route = createFileRoute('/staff/')({
  component: StaffManagementPage,
  beforeLoad: requireAuth,
})

function StaffManagementPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users2 className="h-8 w-8 text-gray-700" />
            Staff Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage admin, waiters, and kitchen staff access for your restaurant.
          </p>
        </div>
        <CreateStaffDialog />
      </div>

      <StaffList />
    </div>
  )
}
