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
    <div className="bg-gray-50/50 font-sans px-4 py-4 md:py-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl border shadow-sm">
              <Users2 className="h-6 w-6 text-gray-700" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Staff Management
            </h1>
          </div>
          <p className="text-gray-500 text-sm md:text-base max-w-lg leading-relaxed pt-1">
            Manage admin, waiters, and kitchen staff access for your restaurant.
          </p>
        </div>
        <div className="shrink-0">
          <CreateStaffDialog />
        </div>
      </div>

      <StaffList />
    </div>
  )
}
