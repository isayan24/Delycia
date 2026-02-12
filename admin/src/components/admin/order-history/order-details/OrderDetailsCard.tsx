import { memo, useMemo } from 'react'
import CustomerAvatar from '../CustomerAvatar'
import { CustomerInfo, TransformedOrderItem } from '../utils/orderHistoryUtils'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'
import { formatDateTime } from '@/utils/dateUtils'

interface TimelineStep {
  label: string
  time: string
  completed: boolean
  hasView?: boolean
}

interface OrderDetailsCardProps {
  orderId: string
  orderDate: Date
  status: 'DELIVERED' | 'CANCELLED'
  customerName: string
  customer?: CustomerInfo
  customerRating?: number
  deliveryTime: string
  timeline: TimelineStep[]
  items: TransformedOrderItem[]
  paymentMethod: string
  deliveryType: string
  specialInstructions?: string
  tableNo: number | any
  paymentStatus: string
  discountAmount?: number
  rid?: number
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

const OrderDetailsCard = memo(function OrderDetailsCard({
  orderId,
  orderDate,
  status,
  customerName,
  customer,
  customerRating,
  deliveryTime,
  timeline,
  items,
  paymentMethod,
  deliveryType,
  specialInstructions,
  tableNo,
  paymentStatus,
  discountAmount,
  rid,
}: OrderDetailsCardProps) {
  // Calculate subtotal from items
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items],
  )

  // Calculate tax using the hook
  const { grandTotal, taxAmount, taxPercent } = useOrderTaxCalculation({
    subtotal,
    discountAmount: discountAmount || 0,
    rid,
  })

  // Memoize calculations to prevent unnecessary recalculations
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )
  const discount = useMemo(
    () => parseFloat(String(discountAmount || 0)),
    [discountAmount],
  )
  const statusColorClass = useMemo(() => getStatusColor(status), [status])
  const timelineColorClass = useMemo(() => getTimelineColor(status), [status])

  return (
    <div className="bg-white p-6 h-auto overflow-y-auto ">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            ID: {orderId}
          </h2>
          <span
            className={`px-3 py-1 rounded-md text-sm font-medium ${statusColorClass}`}
          >
            {status}
          </span>
        </div>
        <div className="text-right">
          <div className="text-gray-600 mb-3">{formatDateTime(orderDate)}</div>
          <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50">
            Help
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          {customer && (
            <CustomerAvatar
              initials={customer.initials}
              name={customer.name}
              size="md"
            />
          )}
          <div>
            <div className="text-gray-900 font-medium">
              {customer?.name || customerName}
            </div>
            <div className="text-gray-600 text-sm">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
              {customer?.phone && ` • ${customer.phone}`}
            </div>
          </div>
        </div>
        {customerRating && (
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Customer rating</span>
            <div className="flex items-center bg-green-700 text-white px-2 py-1 rounded-md">
              <span className="text-sm font-medium">{customerRating}</span>
              <span className="ml-1">★</span>
            </div>
          </div>
        )}
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-2 gap-4 mb-3 p-4 bg-gray-50 rounded-lg">
        <div>
          <span className="text-sm text-gray-500">Payment Method</span>
          <p className="font-medium capitalize">{paymentMethod}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Payment Status</span>
          <p className="font-medium capitalize">{paymentStatus}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Delivery Type</span>
          <p className="font-medium capitalize">{deliveryType}</p>
        </div>
        {tableNo > 0 && (
          <div>
            <span className="text-sm text-gray-500">Table Number</span>
            <p className="font-medium">{tableNo}</p>
          </div>
        )}
      </div>

      {/* Special Instructions */}
      {specialInstructions && (
        <div className="mb-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 mb-1">
            Special Instructions
          </h4>
          <p className="text-sm text-yellow-700">{specialInstructions}</p>
        </div>
      )}

      {/* Timeline Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">ORDER TIMELINE</h3>
        <span className="text-gray-600">{deliveryTime}</span>
      </div>

      {/* Order Timeline */}
      <div className="mb-8 px-10">
        <div className="relative">
          {/* Timeline line */}
          <div
            className={`absolute top-6 left-6 right-6 h-0.5 ${timelineColorClass}`}
          ></div>

          {/* Timeline steps */}
          <div className="flex justify-between relative">
            {timeline.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    step.completed ? timelineColorClass : 'bg-gray-300'
                  }`}
                >
                  {step.completed && (
                    <svg
                      className="w-6 h-6 text-white"
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
                  <div className="text-sm text-gray-700 font-medium">
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-500">{step.time}</div>
                  {step.hasView && (
                    <button className="text-blue-500 text-xs mt-1 hover:underline">
                      View
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* todo: print bill */}
      <div>
        {/* <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">ORDER DETAILS</h3>
          {status === 'DELIVERED' && (
            <button className="px-4 py-2 bg-blue-800 text-white !rounded-md hover:bg-blue-900 flex items-center transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              PRINT BILL
            </button>
          )}
        </div> */}

        {/* Items */}
        <div className="space-y-4 mb-3">
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {item.quantity} x {item.name}
                    {item.variant_name && (
                      <span className="text-gray-600 font-normal">
                        {' '}
                        ({item.variant_name})
                      </span>
                    )}
                  </div>
                  {item.addons && item.addons.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {item.addons.map((addon: any, idx: number) => (
                        <div
                          key={idx}
                          className="text-xs text-gray-500 pl-4 flex gap-1"
                        >
                          <span>+</span>
                          <span>
                            {addon.quantity} x {addon.name}
                          </span>
                          <span>(₹{addon.price})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  ₹{item.price.toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-4">
              No items available
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          {discountAmount && parseFloat(String(discountAmount)) > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Discount
              </span>
              <span className="text-sm font-medium text-green-600">
                -₹{discount.toFixed(2)}
              </span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Tax ({taxPercent}%)
              </span>
              <span className="text-sm font-medium text-gray-600">
                +₹{taxAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">
              Total Amount
            </span>
            <span className="text-xl font-bold text-gray-900">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

export default OrderDetailsCard
