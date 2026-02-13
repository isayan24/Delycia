import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Printer, MessageSquare } from 'lucide-react'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { ProcessedOrder } from '@/types/WebSocketOrder'
import ThermalBill from '@/components/billing/ThermalBill'
import { orderToBillData, handleShareToMobile } from '@/components/billing'
import { calculateTimeElapsed, formatTimeElapsed } from '@/utils/dateUtils'
import { formatOrderTime } from '../utils/orderProcessing'

interface CompactOrderHeaderProps {
  order: ProcessedOrder
  statusBadge: React.ReactNode
  finalAmount?: number
}

export function CompactOrderHeader({
  order,
  statusBadge,
  finalAmount,
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

  // Check for special instructions
  const specialInstructions = order.items.find(
    (item) =>
      item.special_instructions && item.special_instructions.trim() !== '',
  )?.special_instructions

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
    <div className="space-y-2">
      {/* Status and Order Type Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {statusBadge}
          <Badge
            className={`${orderType.color} border-none font-semibold text-[10px] md:text-xs uppercase tracking-wider px-2 py-0.5 rounded-md`}
          >
            {orderType.icon} {orderType.text}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-gray-900 shrink-0"
          onClick={() => setShowThermalBill(true)}
          title="Print Bill"
        >
          <Printer className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Customer Avatar */}
          <div className="w-8 h-8 md:w-10 md:h-10 bg-linear-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm shrink-0 shadow-sm border border-white/20">
            {order.customer_name.charAt(0).toUpperCase()}
          </div>

          {/* Customer Details */}
          <div className="flex-1 min-w-0">
            <p className="text-sm md:text-base font-semibold text-gray-900 truncate leading-tight">
              {order.customer_name}
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] md:text-xs text-gray-500 mt-0.5">
              <span className="font-semibold text-gray-600 shrink-0">
                {order.customer_phone_masked}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                <span>
                  {formatOrderTime(order.created_at)} (
                  {formatTimeElapsed(currentTimeElapsed)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Total */}
        <div className="text-right shrink-0">
          <p className="text-sm md:text-lg font-semibold text-gray-900 leading-none">
            ₹
            {finalAmount !== undefined
              ? finalAmount.toFixed(2)
              : order.total_amount}
          </p>
          <p className="text-[10px] md:text-xs text-gray-400 font-semibold mt-1 uppercase tracking-tighter">
            ID: {order.customer_id}
          </p>
        </div>
      </div>

      {/* Special Instructions */}
      {specialInstructions && (
        <div className="flex items-start gap-1.5 px-2.5 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-lg">
          <MessageSquare className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] md:text-xs text-amber-800 dark:text-amber-300 leading-snug italic">
            {specialInstructions}
          </p>
        </div>
      )}
    </div>
  )
}
