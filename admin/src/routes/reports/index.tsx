import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, Package, TrendingUp, Users } from 'lucide-react'

export const Route = createFileRoute('/reports/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports</h1>
        <p className="text-gray-600">View sales and inventory analytics</p>
      </div>
      <div className="flex gap-6 flex-wrap">
        {/* Sales Reports Card */}
        <Link
          to="/reports/sales"
          className="flex-1 min-w-[17rem] max-w-[30rem]"
        >
          <div className="relative rounded-xl border-2 h-[13rem] border-blue-600 overflow-hidden bg-blue-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <TrendingUp
                    className="w-8 h-8 text-blue-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-lg text-gray-700">Sales Reports</p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-8 opacity-75">
              <span className="flex gap-1 items-center text-sm">
                View Reports
                <ChevronRight className="w-4 h-4" strokeWidth={3} />
                <ChevronRight className="w-4 h-4 -ml-3" strokeWidth={3} />
              </span>
            </div>
          </div>
        </Link>

        {/* Inventory Report Card */}
        <Link
          to="/reports/inventory"
          className="flex-1 min-w-[17rem] max-w-[30rem]"
        >
          <div className="relative rounded-xl border-2 h-[13rem] border-green-600 overflow-hidden bg-green-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                  <Package
                    className="w-8 h-8 text-green-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-lg text-gray-700">Inventory Report</p>
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

        <Link to="/reports/crm" className="flex-1 min-w-[17rem] max-w-[30rem]">
          <div className="relative rounded-xl border-2 h-[13rem] border-orange-600 overflow-hidden bg-orange-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                  <Package
                    className="w-8 h-8 text-orange-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-lg text-gray-700">Customer Report</p>
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

        {/* Staff Reports Card */}
        <Link
          to="/reports/staff"
          className="flex-1 min-w-[17rem] max-w-[30rem]"
        >
          <div className="relative rounded-xl border-2 h-[13rem] border-purple-600 overflow-hidden bg-purple-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                  <Users
                    className="w-8 h-8 text-purple-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-lg text-gray-700">Staff Reports</p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-8 opacity-75">
              <span className="flex gap-1 items-center text-sm">
                View Reports
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
