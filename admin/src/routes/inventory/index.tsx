import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, Utensils, Boxes } from 'lucide-react'

export const Route = createFileRoute('/inventory/')({
  component: InventoryOverviewPage,
})

function InventoryOverviewPage() {
  return (
    <div className="max-w-[50rem] p-2">
      <div className='flex gap-3 items-center'>
        <div>
          <h1 className="text-lg sm:text-xl font-[700] tracking-[0.08rem] text-[#000000] pl-0.5">
            Inventory
          </h1>
          <div className="px-1 mb-4">
            <h2 className="text-[12px] lg:text-[15px] font-[500] tracking-[0.07rem] text-[#000000] opacity-80 mb-1">
              Manage your inventory
            </h2>
            <div className="h-[2px] w-12 bg-emerald-500 rounded-full" />
          </div>
        </div>
      </div> 
      <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-6 sm:flex-wrap">
        {/* Manage Menu Card */}
        <Link to="/inventory/menu" className="flex-1 sm:min-w-[20rem]">
          <div className="relative rounded-lg sm:rounded-xl border-2 h-[8rem] sm:h-[13rem] border-rose-600 overflow-hidden bg-rose-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-1 sm:space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-rose-100 group-hover:bg-rose-200 transition-colors">
                  <Utensils
                    className="w-5 h-5 sm:w-8 sm:h-8 text-rose-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-xs sm:text-lg text-gray-700">
                    Manage Menu
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-6 sm:h-8 opacity-75">
              <span className="flex gap-1 items-center text-[10px] sm:text-sm">
                <span className="hidden sm:inline">View Menu</span>
                <span className="sm:hidden">Menu</span>
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

        {/* Manage Inventory Card */}
        <Link to="/inventory/stock" className="flex-1 sm:min-w-[20rem]">
          <div className="relative rounded-lg sm:rounded-xl border-2 h-[8rem] sm:h-[13rem] border-amber-600 overflow-hidden bg-amber-200 flex flex-col">
            {/* Upper white section */}
            <div className="h-full bg-white rounded-lg sm:rounded-xl flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-1 sm:space-y-2 rounded-xl">
                {/* Icon */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-amber-100 group-hover:bg-amber-200 transition-colors">
                  <Boxes
                    className="w-5 h-5 sm:w-8 sm:h-8 text-amber-600"
                    strokeWidth={2.5}
                  />
                </div>
                {/* Count and Label */}
                <div className="text-center">
                  <p className="text-xs sm:text-lg text-gray-700">
                    Manage Inventory
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="relative cursor-pointer w-full flex justify-center h-6 sm:h-8 opacity-75">
              <span className="flex gap-1 items-center text-[10px] sm:text-sm">
                <span className="hidden sm:inline">View Stock</span>
                <span className="sm:hidden">Stock</span>
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
