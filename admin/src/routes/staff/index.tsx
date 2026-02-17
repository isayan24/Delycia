import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'
import { StaffList } from '@/components/admin/staff/StaffList'
import { CreateStaffDialog } from '@/components/admin/staff/CreateStaffDialog'

export const Route = createFileRoute('/staff/')({
  component: StaffManagementPage,
  beforeLoad: requireAuth,
})

function StaffManagementPage() {
  return (
    <div className="bg-slate-50/50 font-sans px-4 py-4 md:py-8 max-w-7xl mx-auto space-y-6 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-[#a16b45] opacity-80 mb-1">
            Access Control & Roles
          </h2>
          <div className="h-0.5 w-12 bg-orange-500 rounded-full" />
        </div>
        <div className="shrink-0">
          <CreateStaffDialog />
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <StaffList />
      </div>
    </div>
  )
}
