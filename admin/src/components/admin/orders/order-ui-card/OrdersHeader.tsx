import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Bell, BellOff } from 'lucide-react'

interface OrdersHeaderProps {
  orderCount: number
  status: string
  onRefresh: () => void
  isConnected: boolean
  popupsEnabled?: boolean
  onTogglePopups?: () => void
}

export function OrdersHeader({
  orderCount,
  status,
  onRefresh,
  isConnected,
  popupsEnabled = true,
  onTogglePopups,
}: OrdersHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 bg-white p-2.5 sm:p-4 rounded-xl border shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-gray-900 border-l-4 border-primary pl-2 sm:pl-3">
            Orders
          </h1>
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
            title={isConnected ? 'Connected' : status}
          />
        </div>
        <Badge
          variant="secondary"
          className="text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0"
        >
          {orderCount}{' '}
          <span className="hidden sm:inline-block">
            {orderCount === 1 ? 'order' : 'orders'}
          </span>
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {onTogglePopups && (
          <Button
            variant={popupsEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={onTogglePopups}
            className={`h-8 w-8 sm:w-auto sm:px-3 p-0 sm:gap-1.5 rounded-lg transition-all ${popupsEnabled ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100 text-white border-none' : 'bg-white'}`}
          >
            {popupsEnabled ? (
              <Bell className="h-3.5 w-3.5" />
            ) : (
              <BellOff className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline-block">
              {popupsEnabled ? 'Popups On' : 'Popups Off'}
            </span>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-8 w-8 sm:w-auto sm:px-3 p-0 sm:gap-1.5 rounded-lg border-gray-200 hover:bg-gray-50 bg-white shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline-block">Refresh</span>
        </Button>
      </div>
    </div>
  )
}
