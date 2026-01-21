import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ChevronRight,
  CookingPot,
  History,
  Package,
  TrendingUp,
} from 'lucide-react'

export const Route = createFileRoute('/orders/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="max-w-[50rem]">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Orders</h1>
        <p className="text-gray-600">Manage your orders</p>
      </div>
      <div className="flex gap-6 flex-wrap">
        {/* Sales Reports Card */}
        <Link to="/orders" className="flex-1 min-w-[20rem]">
          <div className="relative rounded-xl border-2 h-[13rem] border-amber-600 overflow-hidden bg-amber-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-amber-100 group-hover:bg-amber-200 transition-colors">
                  <CookingPot
                    className="w-8 h-8 text-amber-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-lg text-gray-700">Orders</p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-8 opacity-75">
              <span className="flex gap-1 items-center text-sm">
                View Orders
                <ChevronRight className="w-4 h-4" strokeWidth={3} />
                <ChevronRight className="w-4 h-4 -ml-3" strokeWidth={3} />
              </span>
            </div>
          </div>
        </Link>

        {/* Inventory Report Card */}
        <Link to="/orders/history" className="flex-1 min-w-[20rem]">
          <div className="relative rounded-xl border-2 h-[13rem] border-blue-600 overflow-hidden bg-blue-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <History
                    className="w-8 h-8 text-blue-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-lg text-gray-700">Order History</p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-8 opacity-75">
              <span className="flex gap-1 items-center text-sm">
                View Order History
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
