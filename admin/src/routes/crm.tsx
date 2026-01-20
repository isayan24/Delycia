import { createFileRoute } from '@tanstack/react-router'
import { useCRMListQuery } from '@/hooks/queries/useCRMQueries'
import CustomerList from '@/components/admin/crm/CustomerList'
import CRMStats from '@/components/admin/crm/CRMStats'
import CustomerDetailsSheet from '@/components/admin/crm/CustomerDetailsSheet'
import { Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

export const Route = createFileRoute('/crm')({
  component: CRMPage,
})

function CRMPage() {
  const { user } = useAuth()
  const rid = user?.selected_rid
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  )

  const { data: customers = [], isLoading } = useCRMListQuery({
    rid: rid?.toString() || '',
  })

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="border-b bg-white px-4 py-8 shadow-sm sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Customer Relationship Management
              </h1>
              <p className="text-sm text-gray-500">
                Manage your customer database and view detailed insights
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!rid ? (
          <div className="bg-red-50 p-4 rounded-md text-red-600">
            Error: Restaurant ID not found. Please log in again.
          </div>
        ) : (
          <>
            <CRMStats />
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
        )}
      </div>
    </div>
  )
}
