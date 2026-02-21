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
    <div className="bg-white dark:bg-[#0f0a07] font-sans px-4 py-6 max-w-7xl mx-auto space-y-6 min-h-screen">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-primary/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Staff Management
          </h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">
            Manage team access levels
          </p>
        </div>
        <CreateStaffDialog />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-1 duration-400">
        <StaffList />
      </div>
    </div>
  )
}
