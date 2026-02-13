import { createFileRoute } from '@tanstack/react-router'
import { useCRMListQuery } from '@/hooks/queries/useCRMQueries'
import CustomerList from '@/components/admin/crm/CustomerList'
import CRMStats from '@/components/admin/crm/CRMStats'
import CustomerDetailsSheet from '@/components/admin/crm/CustomerDetailsSheet'
import { Users } from 'lucide-react'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useState } from 'react'
import { Button as StatefulButton } from '@/components/ui/stateful-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/reports/crm')({
  beforeLoad: requireAuth,
  validateSearch: (
    search: Record<string, unknown>,
  ): { customerId?: string } => {
    return {
      customerId: (search.customerId as string) || undefined,
    }
  },
  component: CRMPage,
})

function CRMPage() {
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid
  const search = Route.useSearch()
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    search.customerId || null,
  )
  const [timeRange, setTimeRange] = useState('this_month')

  const {
    data: customers = [],
    isLoading,
    refetch,
  } = useCRMListQuery({
    rid: rid?.toString() || '',
    timeRange,
  })

  const handleRefresh = async () => {
    await refetch()
  }

  return (
    <div className="font-sans px-3 py-2 md:py-4">
      <div className="  space-y-2">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] border border-gray-100/80">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Users className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h1 className="text-md md:text-xl font-semibold tracking-tight text-gray-900">
                Customer Management
              </h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">
                Manage your customer database and view detailed insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={timeRange}
              onValueChange={(value: any) => setTimeRange(value)}
            >
              <SelectTrigger className="w-[140px] md:w-[180px] h-9 md:h-10 bg-gray-50/50 border-gray-100 text-xs md:text-sm font-medium rounded-xl focus:ring-orange-500/10">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
            <StatefulButton
              onClick={handleRefresh}
              className="h-9 md:h-10 px-4 text-xs md:text-sm font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-sm transition-all active:scale-95"
            >
              Refresh
            </StatefulButton>
          </div>
        </div>

        <div className="mx-auto">
          <>
            <CRMStats timeRange={timeRange} />
            <CustomerList
              data={customers}
              isLoading={isLoading}
              onSelectCustomer={(id) => setSelectedCustomerId(id)}
            />
            <CustomerDetailsSheet
              customerId={selectedCustomerId}
              isOpen={!!selectedCustomerId}
              onClose={() => setSelectedCustomerId(null)}
            />
          </>
        </div>
      </div>
    </div>
  )
}
