import React from 'react'
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
  onTogglePopups
}: OrdersHeaderProps) {
  const getStatusColor = () => {
    if (isConnected) return 'bg-green-100 text-green-800 hover:bg-green-100'
    if (status.includes('Reconnecting')) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800 hover:bg-red-100'
  }

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Badge variant="secondary" className="text-sm">
          {orderCount} {orderCount === 1 ? 'order' : 'orders'}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Badge className={getStatusColor()}>
          {status}
        </Badge>
        {onTogglePopups && (
          <Button
            variant={popupsEnabled ? "default" : "outline"}
            size="sm"
            onClick={onTogglePopups}
            className="flex items-center gap-2"
          >
            {popupsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {popupsEnabled ? 'Popups On' : 'Popups Off'}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  )
}