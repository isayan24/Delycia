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
    <div className="max-w-[50rem] p-2">
      <div className='flex gap-3 items-center'>
        <div>
          <h1 className="text-lg sm:text-xl font-[700] tracking-[0.08rem] text-[#000000] pl-0.5">
            Billing
          </h1>
          <div className="px-1 mb-4">
            <h2 className="text-[12px] lg:text-[15px] font-[500] tracking-[0.07rem] text-[#000000] opacity-80 mb-1">
              Manage billing and payments
            </h2>
            <div className="h-[2px] w-12 bg-emerald-500 rounded-full" />
          </div>
        </div>
      </div>  
      <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-6 sm:flex-wrap">
        {/* Sales Reports Card */}
        <Link to="/billing/quick-bill" className="flex-1 sm:min-w-[20rem]">
          <div className="relative rounded-lg sm:rounded-xl border-2 h-[8rem] sm:h-[13rem] border-emerald-600 overflow-hidden bg-emerald-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-1 sm:space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                  <ReceiptIndianRupee
                    className="w-5 h-5 sm:w-8 sm:h-8 text-emerald-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-xs sm:text-lg text-gray-700">Quick Bill</p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-6 sm:h-8 opacity-75">
              <span className="flex gap-1 items-center text-[10px] sm:text-sm">
                <span className="hidden sm:inline">View Details</span>
                <span className="sm:hidden">View</span>
                <ChevronRight
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  strokeWidth={3}
                />
                <ChevronRight
                  className="w-3 h-3 sm:w-4 sm:h-4 -ml-2 sm:-ml-3"
                  strokeWidth={3}
                />
              </span>
            </div>
          </div>
        </Link>

        {/* Inventory Report Card */}
        <Link to="/billing/book-table" className="flex-1 sm:min-w-[20rem]">
          <div className="relative rounded-lg sm:rounded-xl border-2 h-[8rem] sm:h-[13rem] border-red-600 overflow-hidden bg-red-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-1 sm:space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
                  <TableBar
                    className="w-5 h-5 sm:w-8 sm:h-8 text-red-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-xs sm:text-lg text-gray-700">
                    Book A Table
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-6 sm:h-8 opacity-75">
              <span className="flex gap-1 items-center text-[10px] sm:text-sm">
                <span className="hidden sm:inline">View Details</span>
                <span className="sm:hidden">View</span>
                <ChevronRight
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  strokeWidth={3}
                />
                <ChevronRight
                  className="w-3 h-3 sm:w-4 sm:h-4 -ml-2 sm:-ml-3"
                  strokeWidth={3}
                />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
