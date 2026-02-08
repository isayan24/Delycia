import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, Package, TrendingUp, Users } from 'lucide-react'

export const Route = createFileRoute('/reports/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-2">
      {/* Header Section */}
      <div className="mb-4 sm:mb-8 ">
        <h1 className="text-lg sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
          Reports
        </h1>
        <p className="text-xs sm:text-base text-gray-600">
          View sales and inventory analytics
        </p>
      </div>
      <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-6 sm:flex-wrap">
        {/* Sales Reports Card */}
        <Link
          to="/reports/sales"
          className="flex-1 sm:min-w-[17rem] sm:max-w-[30rem]"
        >
          <div className="relative rounded-lg sm:rounded-xl border-2 h-[8rem] sm:h-[13rem] border-blue-600 overflow-hidden bg-blue-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-1 sm:space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <TrendingUp
                    className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-xs sm:text-lg text-gray-700">
                    Sales Reports
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-6 sm:h-8 opacity-75">
              <span className="flex gap-1 items-center text-[10px] sm:text-sm">
                <span className="hidden sm:inline">View Reports</span>
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
        <Link
          to="/reports/inventory"
          className="flex-1 sm:min-w-[17rem] sm:max-w-[30rem]"
        >
          <div className="relative rounded-lg sm:rounded-xl border-2 h-[8rem] sm:h-[13rem] border-green-600 overflow-hidden bg-green-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-1 sm:space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                  <Package
                    className="w-5 h-5 sm:w-8 sm:h-8 text-green-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-xs sm:text-lg text-gray-700">
                    Inventory Report
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

        <Link
          to="/reports/crm"
          className="flex-1 sm:min-w-[17rem] sm:max-w-[30rem]"
        >
          <div className="relative rounded-lg sm:rounded-xl border-2 h-[8rem] sm:h-[13rem] border-orange-600 overflow-hidden bg-orange-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-1 sm:space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                  <Package
                    className="w-5 h-5 sm:w-8 sm:h-8 text-orange-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-xs sm:text-lg text-gray-700">
                    Customer Report
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

        {/* Staff Reports Card */}
        <Link
          to="/reports/staff"
          className="flex-1 sm:min-w-[17rem] sm:max-w-[30rem]"
        >
          <div className="relative rounded-lg sm:rounded-xl border-2 h-[8rem] sm:h-[13rem] border-purple-600 overflow-hidden bg-purple-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-1 sm:space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                  <Users
                    className="w-5 h-5 sm:w-8 sm:h-8 text-purple-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-xs sm:text-lg text-gray-700">
                    Staff Reports
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-6 sm:h-8 opacity-75">
              <span className="flex gap-1 items-center text-[10px] sm:text-sm">
                <span className="hidden sm:inline">View Reports</span>
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
