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
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white shadow-sm ">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <section className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-[500] tracking-tight text-gray-900 max-[500px]:text-xl">
                Customer Relationship Management
              </h1>
              <p className="text-sm text-gray-500">
                Manage your customer database and view detailed insights
              </p>
            </div>
          </section>
          <section className="mb-6 flex items-center gap-2">
            <Select
              value={timeRange}
              onValueChange={(value: any) => setTimeRange(value)}
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
            <StatefulButton onClick={handleRefresh} className="shadow-sm">
              Refresh
            </StatefulButton>
          </section>
        </div>
      </div>

      <div className="mx-auto mt-6">
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
  )
}
