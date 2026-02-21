import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useTableStore } from '@/store/useTableStore'
import {
  ChevronLeft,
  Edit3,
  Trash2,
  MapPin,
  Receipt,
  User,
  UtensilsCrossed,
} from 'lucide-react'
import { RestaurantActiveToggle } from '../header/RestaurantActiveToggle'
import { NotificationBell } from '@/components/common/NotificationBell'
import RouteBreadcrumbs from '@/components/common/RouteBreadcrumbs'

export default function BookTableHeader() {
  const {
    currentState,
    changeState,
    table,
    orderItems,
    clearAllItems,
    getTotalAmount,
  } = useTableStore()

  // Step 0: Default AdminHeader-like layout
  if (currentState === 0) {
    return (
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2 flex-1">
          <SidebarTrigger className="-ml-1 h-9 w-9 text-gray-500 hover:bg-gray-100 transition-colors" />
          <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />
          <RouteBreadcrumbs />
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <div className="hidden sm:flex items-center">
            <RestaurantActiveToggle />
          </div>
          <div className="h-8 w-px bg-gray-100 hidden sm:block" />
          <NotificationBell />
        </div>
      </header>
    )
  }

  // Step 1: Select Items
  if (currentState === 1) {
    return (
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => changeState(0)}
            className="p-1.5 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">
              Add Items
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {table?.table_number && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 px-2.5 py-1.5 rounded-lg">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">T-{table.table_number}</span>
            </div>
          )}
          {orderItems.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg font-bold">
              {orderItems.length} item{orderItems.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </header>
    )
  }

  // Step 2: Preview Order
  if (currentState === 2) {
    return (
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => changeState(1)}
            className="p-1.5 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
              <Receipt className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">
              Order Preview
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              changeState(0)
              clearAllItems()
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl text-xs h-8 px-3"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeState(1)}
            className="rounded-xl text-xs h-8 px-3 border-gray-200 dark:border-gray-700"
          >
            <Edit3 className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
        </div>
      </header>
    )
  }

  // Step 3: Customer Details
  if (currentState === 3) {
    const totalAmount = getTotalAmount()
    return (
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => changeState(2)}
            className="p-1.5 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">
              Customer Details
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {table?.table_number && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 px-2.5 py-1.5 rounded-lg">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">T-{table.table_number}</span>
            </div>
          )}
          <div className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
            ₹{totalAmount.toFixed(2)}
          </div>
        </div>
      </header>
    )
  }

  // Fallback
  return null
}
