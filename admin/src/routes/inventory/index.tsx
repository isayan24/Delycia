import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, Utensils, Boxes } from 'lucide-react'

export const Route = createFileRoute('/inventory/')({
  component: InventoryOverviewPage,
})

function InventoryOverviewPage() {
  return (
    <div className="max-w-[50rem]">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Inventory</h1>
        <p className="text-gray-600">Manage your inventory</p>
      </div>
      <div className="flex gap-6 flex-wrap">
        {/* Manage Menu Card */}
        <Link to="/inventory/menu" className="flex-1 min-w-[20rem]">
          <div className="relative rounded-xl border-2 h-[13rem] border-rose-600 overflow-hidden bg-rose-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-rose-100 group-hover:bg-rose-200 transition-colors">
                  <Utensils
                    className="w-8 h-8 text-rose-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-lg text-gray-700">Manage Menu</p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-8 opacity-75">
              <span className="flex gap-1 items-center text-sm">
                View Menu
                <ChevronRight className="w-4 h-4" strokeWidth={3} />
                <ChevronRight className="w-4 h-4 -ml-3" strokeWidth={3} />
              </span>
            </div>
          </div>
        </Link>

        {/* Manage Inventory Card */}
        <Link to="/inventory/stock" className="flex-1 min-w-[20rem]">
          <div className="relative rounded-xl border-2 h-[13rem] border-amber-600 overflow-hidden bg-amber-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-amber-100 group-hover:bg-amber-200 transition-colors">
                  <Boxes className="w-8 h-8 text-amber-600" strokeWidth={2.5} />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-lg text-gray-700">Manage Inventory</p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-8 opacity-75">
              <span className="flex gap-1 items-center text-sm">
                View Stock
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
