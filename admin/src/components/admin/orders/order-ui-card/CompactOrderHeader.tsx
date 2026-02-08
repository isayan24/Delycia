import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, Clock } from 'lucide-react'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import {
  formatOrderTime,
  formatTimeElapsed,
  calculateTimeElapsed,
} from '../utils/orderProcessing'
import { Printer } from 'lucide-react'
import ThermalBill from '@/components/admin/order-history/ThermalBill'
import {
  orderToBillData,
  handleShareToMobile,
} from '@/components/admin/order-history/thermalBillUtils'

interface CompactOrderHeaderProps {
  order: ProcessedOrder
  statusBadge: React.ReactNode
  onCall: (customerId: number) => void
  onViewTimeline: (customerId: number) => void
  showCallButton?: boolean
  timeElapsed?: number
}

export function CompactOrderHeader({
  order,
  statusBadge,
  onCall,
  onViewTimeline,
  showCallButton = false,
  timeElapsed,
}: CompactOrderHeaderProps) {
  const [currentTimeElapsed, setCurrentTimeElapsed] = useState(
    calculateTimeElapsed(order.created_at),
  )
  const [showThermalBill, setShowThermalBill] = useState(false)
  const { selectedRestaurant } = useRestaurantSelector()

  // Update time elapsed every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeElapsed(calculateTimeElapsed(order.created_at))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [order.created_at])

  const getOrderTypeDisplay = () => {
    if (order.is_delivery) {
      return {
        text: 'DELIVERY',
        color: 'bg-blue-100 text-blue-800',
        icon: '🚚',
      }
    } else if (
      order.items.some((item: any) => item.table_zone || item.table_number)
    ) {
      // Get table info from first item with zone/number data
      const tableItem = order.items.find(
        (item: any) => item.table_zone || item.table_number,
      )
      const zone = tableItem?.table_zone || ''
      const number =
        tableItem?.table_number || order.unique_table_numbers[0] || ''
      const tableDisplay = zone
        ? `${zone} - Table ${number}`
        : `Table ${number}`
      return {
        text: tableDisplay.toUpperCase(),
        color: 'bg-green-100 text-green-800 hover:!bg-green-100',
        icon: '🍽️',
      }
    } else if (order.unique_table_numbers.length > 0) {
      // Fallback for old format
      return {
        text: `TABLE ${order.unique_table_numbers.join(', ')}`,
        color: 'bg-green-100 text-green-800 hover:!bg-green-100',
        icon: '🍽️',
      }
    }
    return {
      text: 'TAKEAWAY',
      color: 'bg-orange-100 text-orange-800',
      icon: '🥡',
    }
  }

  const orderType = getOrderTypeDisplay()

  return (
    <div className="space-y-3">
      {/* Status and Order Type Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {statusBadge}
          <Badge className={`${orderType.color} font-medium text-xs`}>
            {orderType.icon} {orderType.text}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-900"
          onClick={() => setShowThermalBill(true)}
          title="Print Bill"
        >
          <Printer className="h-4 w-4" />
        </Button>
      </div>

      {showThermalBill && (
        <ThermalBill
          isOpen={showThermalBill}
          onClose={() => setShowThermalBill(false)}
          billData={orderToBillData(order, selectedRestaurant?.name || '')}
          showPrintButton={true}
          showDownloadButton={true}
          showShareButton={true}
          onShareToMobile={handleShareToMobile}
        />
      )}

      {/* Customer Info Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Customer Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {order.customer_name.charAt(0).toUpperCase()}
          </div>

          {/* Customer Details */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {order.customer_name}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="truncate">{order.customer_phone_masked}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>
                {formatOrderTime(order.created_at)} (
                {formatTimeElapsed(currentTimeElapsed)})
              </span>
            </div>
          </div>
        </div>

        {/* Order Total */}
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-gray-900">
            ₹{order.total_amount}
          </p>
          <p className="text-xs text-gray-500">ID: {order.customer_id}</p>
        </div>
      </div>
    </div>
  )
}
