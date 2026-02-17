import { createFileRoute } from '@tanstack/react-router'
import { useCRMListQuery } from '@/hooks/queries/useCRMQueries'
import CustomerList from '@/components/admin/crm/CustomerList'
import CRMStats from '@/components/admin/crm/CRMStats'
import CustomerDetailsSheet from '@/components/admin/crm/CustomerDetailsSheet'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useState } from 'react'
import { requireAuth } from '@/middleware/auth'
import { z } from 'zod'

const crmSearchSchema = z.object({
  customerId: z.string().optional(),
  timeRange: z.string().optional().catch('this_month'),
})

export const Route = createFileRoute('/reports/crm')({
  beforeLoad: requireAuth,
  validateSearch: (search) => crmSearchSchema.parse(search),
  component: CRMPage,
})

function CRMPage() {
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid
  const { customerId, timeRange = 'this_month' } = Route.useSearch()

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    customerId || null,
  )

  const { data: customers = [], isLoading } = useCRMListQuery({
    rid: rid?.toString() || '',
    timeRange,
  })

  return (
    <div className="bg-slate-50/30 dark:bg-background-dark/30 min-h-screen p-4 md:p-6 transition-colors font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <CRMStats timeRange={timeRange} />

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <CustomerList
            data={customers}
            isLoading={isLoading}
            onSelectCustomer={(id) => setSelectedCustomerId(id)}
          />
        </div>

        <CustomerDetailsSheet
          customerId={selectedCustomerId}
          isOpen={!!selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      </div>
    </div>
  )
}

export default CRMPage
