import React, { memo, useMemo } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  TransformedOrder,
  generateOrderTimeline,
  calculateDeliveryTime,
} from '../utils/orderHistoryUtils'
import CustomerAvatar from '../CustomerAvatar'
import { X } from 'lucide-react'

interface MobileOrderDrawerProps {
  order: TransformedOrder | null
  isOpen: boolean
  onClose: () => void
  onPrintBill: (order: TransformedOrder) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-green-600 text-white'
    case 'CANCELLED':
      return 'bg-red-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

const getTimelineColor = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-green-500'
    case 'CANCELLED':
      return 'bg-red-500'
    default:
      return 'bg-gray-300'
  }
}

const MobileOrderDrawer = memo(function MobileOrderDrawer({
  order,
  isOpen,
  onClose,
  onPrintBill,
}: MobileOrderDrawerProps) {
  // Memoize calculations
  const timeline = useMemo(
    () => (order ? generateOrderTimeline(order) : []),
    [order],
  )
  const deliveryTime = useMemo(
    () => (order ? calculateDeliveryTime(order) : ''),
    [order],
  )
  const totalItems = useMemo(
    () => order?.items.reduce((sum, item) => sum + item.quantity, 0) || 0,
    [order?.items],
  )
  const statusColorClass = useMemo(
    () => (order ? getStatusColor(order.status) : ''),
    [order?.status],
  )
  const timelineColorClass = useMemo(
    () => (order ? getTimelineColor(order.status) : ''),
    [order?.status],
  )

  if (!order) return null

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[75vh]">
        <DrawerHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <DrawerTitle className="text-lg font-semibold">
                ID: {order.orderId}
              </DrawerTitle>
              <DrawerDescription className="text-sm text-gray-600 mt-1">
                {order.time} | {order.date}
              </DrawerDescription>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusColorClass}`}
              >
                {order.status}
              </span>
              <DrawerClose asChild>
                <button className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-4 overflow-y-auto">
          {/* Customer Info */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Customer Information
            </h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {order.customer && (
                <CustomerAvatar
                  initials={order.customer.initials}
                  name={order.customer.name}
                  size="md"
                />
              )}
              <div>
                <div className="font-medium text-gray-900">
                  {order.customer?.name || order.customerName}
                </div>
                <div className="text-gray-600 text-sm">
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                  {order.customer?.phone && ` • ${order.customer.phone}`}
                </div>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Order Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500">Payment Method</span>
                <p className="font-medium capitalize">{order.paymentMethod}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500">Payment Status</span>
                <p className="font-medium capitalize">{order.paymentStatus}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500">Delivery Type</span>
                <p className="font-medium capitalize">{order.deliveryType}</p>
              </div>
              {order.tableNo > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500">Table Number</span>
                  <p className="font-medium">{order.tableNo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Special Instructions
              </h3>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  {order.specialInstructions}
                </p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Order Timeline
              </h3>
              <span className="text-xs text-gray-600">{deliveryTime}</span>
            </div>

            <div className="relative px-4">
              {/* Timeline line */}
              <div
                className={`absolute top-6 left-8 right-8 h-0.5 ${timelineColorClass}`}
              ></div>

              {/* Timeline steps */}
              <div className="flex justify-between relative">
                {timeline.map((step, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? timelineColorClass : 'bg-gray-300'
                      }`}
                    >
                      {step.completed && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <div className="text-xs text-gray-700 font-medium">
                        {step.label}
                      </div>
                      <div className="text-xs text-gray-500">{step.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Order Details
            </h3>
            <div className="space-y-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {item.quantity} x {item.name}
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900">
                      ₹{item.price.toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-4 text-sm">
                  No items available
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4 mb-4">
            {order.discountAmount &&
              parseFloat(String(order.discountAmount)) > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <span className="text-sm text-green-600 font-medium">
                    -₹{parseFloat(String(order.discountAmount)).toFixed(2)}
                  </span>
                </div>
              )}
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                Total Amount
              </span>
              <span className="text-xl font-bold text-gray-900">
                {order.discountAmount &&
                parseFloat(String(order.discountAmount)) > 0
                  ? `₹${(
                      order.totalAmount -
                      parseFloat(String(order.discountAmount))
                    ).toFixed(2)}`
                  : `₹${order.totalAmount.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Print Bill Button - Only show for delivered orders */}
          {order.status === 'DELIVERED' && (
            <div className="pb-4">
              <button
                onClick={() => order && onPrintBill(order)}
                className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                PRINT BILL
              </button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
})

export default MobileOrderDrawer
