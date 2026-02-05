import { TableBar } from '@mui/icons-material'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, ReceiptIndianRupee } from 'lucide-react'
import { requireAuth } from '@/middleware/auth'

export const Route = createFileRoute('/billing/')({
  beforeLoad: requireAuth,
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="max-w-[50rem]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Billing</h1>
        <p className="text-gray-600">Manage billing and payments</p>
      </div>
      <div className="flex gap-6 flex-wrap">
        {/* Sales Reports Card */}
        <Link to="/billing/quick-bill" className="flex-1 min-w-[20rem]">
          <div className="relative rounded-xl border-2 h-[13rem] border-emerald-600 overflow-hidden bg-emerald-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                  <ReceiptIndianRupee
                    className="w-8 h-8 text-emerald-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-lg text-gray-700">Quick Bill</p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-8 opacity-75">
              <span className="flex gap-1 items-center text-sm">
                View Details
                <ChevronRight className="w-4 h-4" strokeWidth={3} />
                <ChevronRight className="w-4 h-4 -ml-3" strokeWidth={3} />
              </span>
            </div>
          </div>
        </Link>

        {/* Inventory Report Card */}
        <Link to="/billing/book-table" className="flex-1 min-w-[20rem]">
          <div className="relative rounded-xl border-2 h-[13rem] border-red-600 overflow-hidden bg-red-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
                  <TableBar
                    className="w-8 h-8 text-red-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-lg text-gray-700">Book A Table</p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-8 opacity-75">
              <span className="flex gap-1 items-center text-sm">
                View Details
                <ChevronRight className="w-4 h-4" strokeWidth={3} />
                <ChevronRight className="w-4 h-4 -ml-3" strokeWidth={3} />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
