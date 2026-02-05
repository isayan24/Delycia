import { createFileRoute, Link } from '@tanstack/react-router'
import { requireAuth } from '@/middleware/auth'
import { ChevronRight, CreditCard, Building2, User } from 'lucide-react'

export const Route = createFileRoute('/settings/')({
  beforeLoad: requireAuth,
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="max-w-[60rem]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your subscription, restaurant settings, and account preferences
        </p>
      </div>

      <div className="flex gap-6 flex-wrap">
        {/* Billing & Subscription Card */}
        <Link to="/settings/subscription" className="flex-1 min-w-[18rem]">
          <div className="relative rounded-xl border-2 h-[13rem] border-violet-600 overflow-hidden bg-violet-200 flex flex-col group hover:shadow-lg transition-shadow">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-violet-100 group-hover:bg-violet-200 transition-colors">
                  <CreditCard
                    className="w-8 h-8 text-violet-600"
                    strokeWidth={2}
                  />
                </div>
                {/* Label */}
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-700">
                    Billing & Subscription
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    View plan, billing details
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-8 opacity-75">
              <span className="flex gap-1 items-center text-sm text-violet-700">
                View Details
                <ChevronRight className="w-4 h-4" strokeWidth={3} />
                <ChevronRight className="w-4 h-4 -ml-3" strokeWidth={3} />
              </span>
            </div>
          </div>
        </Link>

        {/* Restaurant Settings Card - Placeholder */}
        <div className="flex-1 min-w-[18rem] opacity-50 cursor-not-allowed">
          <div className="relative rounded-xl border-2 h-[13rem] border-blue-600 overflow-hidden bg-blue-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100">
                  <Building2
                    className="w-8 h-8 text-blue-600"
                    strokeWidth={2}
                  />
                </div>
                {/* Label */}
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-700">
                    Restaurant Settings
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Coming Soon</p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative w-full flex justify-center h-8 opacity-75">
              <span className="flex gap-1 items-center text-sm text-blue-700">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Account Settings Card */}
        <Link to="/settings/account" className="flex-1 min-w-[18rem]">
          <div className="relative rounded-xl border-2 h-[13rem] border-teal-600 overflow-hidden bg-teal-200 flex flex-col group hover:shadow-lg transition-shadow">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-teal-100 group-hover:bg-teal-200 transition-colors">
                  <User className="w-8 h-8 text-teal-600" strokeWidth={2} />
                </div>
                {/* Label */}
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-700">
                    Account Settings
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage profile & preferences
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative w-full flex justify-center h-8 opacity-75">
              <span className="flex gap-1 items-center text-sm text-teal-700">
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
