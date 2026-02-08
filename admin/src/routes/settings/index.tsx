import { createFileRoute, Link } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'
import { ChevronRight, CreditCard, Building2, User } from 'lucide-react'

export const Route = createFileRoute('/settings/')({
  beforeLoad: requireAuth,
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="max-w-[60rem] p-2">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
          Settings
        </h1>
        <p className="text-xs sm:text-base text-gray-600">
          Manage your subscription, restaurant settings, and account preferences
        </p>
      </div>

      <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-6 sm:flex-wrap">
        {/* Billing & Subscription Card */}
        <Link to="/settings/subscription" className="flex-1 sm:min-w-[18rem]">
          <div className="relative rounded-lg sm:rounded-xl border-2 h-[8rem] sm:h-[13rem] border-violet-600 overflow-hidden bg-violet-200 flex flex-col group hover:shadow-lg transition-shadow">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-1 sm:space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-violet-100 group-hover:bg-violet-200 transition-colors">
                  <CreditCard
                    className="w-5 h-5 sm:w-8 sm:h-8 text-violet-600"
                    strokeWidth={2}
                  />
                </div>
                {/* Label */}
                <div className="text-center px-1">
                  <p className="text-xs sm:text-lg font-medium text-gray-700">
                    Billing
                  </p>
                  <p className="text-[8px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                    View plan, billing details
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-6 sm:h-8 opacity-75">
              <span className="flex gap-1 items-center text-[10px] sm:text-sm text-violet-700">
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

        {/* Restaurant Settings Card */}
        <Link to="/settings/restaurant" className="flex-1 sm:min-w-[18rem]">
          <div className="relative rounded-lg sm:rounded-xl border-2 h-[8rem] sm:h-[13rem] border-blue-600 overflow-hidden bg-blue-200 flex flex-col group hover:shadow-lg transition-shadow">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-1 sm:space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Building2
                    className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600"
                    strokeWidth={2}
                  />
                </div>
                {/* Label */}
                <div className="text-center px-1">
                  <p className="text-xs sm:text-lg font-medium text-gray-700">
                    Restaurant
                  </p>
                  <p className="text-[8px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                    Manage status, tax & more
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-6 sm:h-8 opacity-75">
              <span className="flex gap-1 items-center text-[10px] sm:text-sm text-blue-700">
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

        {/* Account Settings Card */}
        <Link to="/settings/account" className="flex-1 sm:min-w-[18rem]">
          <div className="relative rounded-lg sm:rounded-xl border-2 h-[8rem] sm:h-[13rem] border-teal-600 overflow-hidden bg-teal-200 flex flex-col group hover:shadow-lg transition-shadow">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-1 sm:space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-teal-100 group-hover:bg-teal-200 transition-colors">
                  <User
                    className="w-5 h-5 sm:w-8 sm:h-8 text-teal-600"
                    strokeWidth={2}
                  />
                </div>
                {/* Label */}
                <div className="text-center px-1">
                  <p className="text-xs sm:text-lg font-medium text-gray-700">
                    Account
                  </p>
                  <p className="text-[8px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                    Manage profile & preferences
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative w-full flex justify-center h-6 sm:h-8 opacity-75">
              <span className="flex gap-1 items-center text-[10px] sm:text-sm text-teal-700">
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
