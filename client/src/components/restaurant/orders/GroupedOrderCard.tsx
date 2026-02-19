'use client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import CustomizedSteppers from './OrderStepper'
import { CookingPot, CheckCircle2, XCircle, Clock, Package } from 'lucide-react'
import { GroupedUserOrder, Order } from '@/types/Order'
import UseOptimizeImage from '@/hooks/UseOptimizeImage'
import { parseImageString } from '@/helpers/imageParser'
import { safeJsonParse } from '@/helpers/jsonParser'
import { formatDateTimeIST, formatISTDateTime } from '@/utils/dateUtils'

interface GroupedOrderCardProps {
  group: GroupedUserOrder
}

// Helper function to get status display properties
const getStatusDisplay = (status: string) => {
  const statusLower = status.toLowerCase()

  switch (statusLower) {
    case 'pending':
      return {
        text: 'Pending',
        statusNumber: 0,
        statusDescription: 'Waiting for restaurant confirmation',
        statusColor: '#FFD700', // Gold
        bgColor: 'bg-yellow-500/10',
        textColor: 'text-yellow-600',
        icon: <Clock className="h-4 w-4" />,
      }
    case 'processing':
      return {
        text: 'Processing',
        statusNumber: 2,
        statusDescription: 'Your order is being prepared',
        statusColor: '#ff921d', // Orange
        bgColor: 'bg-yellow-300/10',
        textColor: 'text-orange-600',
        icon: <CookingPot className="h-4 w-4" />,
      }
    case 'ready':
      return {
        text: 'Ready',
        statusNumber: 3,
        statusDescription: 'Your order is ready',
        statusColor: '#26a4ff', // Blue
        bgColor: 'bg-blue-300/10',
        textColor: 'text-blue-600',
        icon: <CheckCircle2 className="h-4 w-4" />,
      }
    case 'completed':
      return {
        text: 'Completed',
        statusNumber: 4,
        statusDescription: 'Your order has been delivered',
        statusColor: '#10B981', // Green
        bgColor: 'bg-green-300/10',
        textColor: 'text-green-600',
        icon: <CheckCircle2 className="h-4 w-4" />,
      }
    case 'cancelled':
      return {
        text: 'Cancelled',
        statusNumber: 5,
        statusDescription: 'Your order has been cancelled',
        statusColor: '#FF0000', // Red
        bgColor: 'bg-red-300/10',
        textColor: 'text-red-600',
        icon: <XCircle className="h-4 w-4" />,
      }
    default:
      return {
        text: status || 'Unknown',
        statusNumber: 0,
        statusDescription: 'Status unknown',
        statusColor: '#6B7280', // Gray
        bgColor: 'bg-gray-300/10',
        textColor: 'text-gray-600',
        icon: <Clock className="h-4 w-4" />,
      }
  }
}

// Get the first valid image from all orders in the group
const getGroupImage = (orders: Order[]): string | null => {
  for (const order of orders) {
    const images = parseImageString(order.foodDetails?.img)
    if (images.length > 0) return images[0]
  }
  return null
}

// Calculate max preparation time from all items
const getMaxPrepTime = (orders: Order[]): number => {
  return Math.max(...orders.map((o) => o.foodDetails?.preparation_time || 0), 0)
}

export default function GroupedOrderCard({ group }: GroupedOrderCardProps) {
  const { orders, cart_id, totalAmount, orderCount, aggregatedStatus } = group

  const {
    text: statusText,
    statusNumber,
    statusDescription,
    statusColor,
    bgColor,
    textColor,
    icon: statusIcon,
  } = getStatusDisplay(aggregatedStatus)

  const displayImage = getGroupImage(orders)
  const maxPrepTime = getMaxPrepTime(orders)
  const firstOrder = orders[0]

  // Format cart ID for display (uppercase, truncate if needed)
  const displayCartId = cart_id.startsWith('single-')
    ? `#${cart_id.replace('single-', '')}`
    : cart_id.toUpperCase()

  return (
    <Accordion type="single" collapsible className="">
      <div className="flex gap-5 items-center justify-between">
        <div className="flex items-center gap-2 ml-2">
          <Package className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs text-gray-500">
            {orderCount} {orderCount === 1 ? 'item' : 'items'}
          </span>
          {maxPrepTime > 0 && (
            <span className="text-xs text-gray-500">
              • Prep time: {maxPrepTime} min
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mr-2">
          Ordered: {formatDateTimeIST(firstOrder?.created_at)}
        </p>
      </div>

      <AccordionItem
        value="item-1"
        className={`rounded-xl shadow-sm ${bgColor}`}
        style={{ border: `1px solid ${statusColor}` }}
      >
        <main className="flex gap-5 max-[600px]:gap-2 justify-between rounded-xl p-2">
          <section className="flex gap-5 max-[600px]:gap-2">
            {/* Group image thumbnail */}
            <div className="rounded-xl overflow-hidden h-[5rem] w-[5rem] border shrink-0 max-[350px]:w-[4rem] max-[350px]:h-[4rem] bg-gray-100 flex items-center justify-center">
              {displayImage ? (
                <UseOptimizeImage
                  src={displayImage}
                  alt="Order items"
                  width={100}
                  height={100}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              ) : (
                <Package className="h-8 w-8 text-gray-300" />
              )}
            </div>

            {/* Items preview - show first item + more count */}
            <div className="mt-1 max-[350px]:mt-0 flex-1">
              {/* First item only */}
              {firstOrder && (
                <div>
                  <div className="flex items-center gap-1">
                    <span className="max-[600px]:text-[.9rem] font-medium">
                      {firstOrder.foodDetails?.name ||
                        `Item #${firstOrder.item_id}`}
                    </span>
                    <span className="text-xs text-gray-500">
                      x{firstOrder.quantity}
                    </span>
                  </div>

                  {/* Addons for first item */}
                  {(() => {
                    const addons = safeJsonParse(firstOrder.addons, [])
                    return (
                      addons &&
                      addons.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {addons.map((addon: any, aidx: number) => (
                            <span
                              key={aidx}
                              className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded"
                            >
                              +{addon.quantity > 1 ? `${addon.quantity}×` : ''}
                              {addon.name}
                            </span>
                          ))}
                        </div>
                      )
                    )
                  })()}
                </div>
              )}

              {/* Show "+ X more" if there are additional items */}
              {orderCount > 1 && (
                <p className="text-xs text-gray-500 mt-1">
                  + {orderCount - 1} more{' '}
                  {orderCount - 1 === 1 ? 'item' : 'items'}
                </p>
              )}

              {/* Total amount for mobile */}
              <h1 className="text-sm min-[800px]:hidden mt-2 font-semibold">
                ₹{totalAmount}
              </h1>
            </div>
          </section>

          <section className="flex gap-10 pt-2 max-[600px]:gap-2 max-[350px]:pt-0 max-[400px]:w-[8rem]">
            {/* Price section - desktop */}
            <div className="max-[800px]:hidden min-[800px]:w-[6rem]">
              <h1 className="font-semibold">₹{totalAmount}</h1>
              <p className="text-xs text-gray-500">
                Payment: {firstOrder?.payment_status || 'N/A'}
              </p>
            </div>

            {/* Status display section */}
            <div className="min-[800px]:w-[13rem]">
              <div className="flex gap-1 items-center">
                <span
                  style={{ backgroundColor: statusColor }}
                  className="flex w-2 h-2 rounded-full"
                ></span>
                <h1
                  style={{ border: `1px solid ${statusColor}` }}
                  className={`${bgColor} ${textColor} rounded-2xl p-1 px-3 max-[600px]:text-[.9rem] flex items-center gap-1`}
                >
                  {statusText}
                  <span className="ml-1">{statusIcon}</span>
                </h1>
              </div>
              <p className="text-xs text-gray-500 ml-3 max-[600px]:text-[0.6rem]">
                {statusDescription}
              </p>
              <div className="text-xs max-[600px]:text-[.6rem] text-gray-700 ml-3 mt-2 font-[500]">
                Order ID: {displayCartId}
              </div>
            </div>
            <AccordionTrigger className="max-[800px]:hidden"></AccordionTrigger>
          </section>
        </main>

        <AccordionContent className="p-5 border-t">
          <div>
            <CustomizedSteppers
              activeStep={statusNumber}
              status={aggregatedStatus}
            />
          </div>

          {/* Individual order details within the group */}
          {orderCount > 1 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Order Items Detail
              </h4>
              <div className="space-y-2">
                {orders.map((order) => {
                  const addons = safeJsonParse(order.addons, [])
                  const orderStatus = getStatusDisplay(order.order_status)

                  return (
                    <div
                      key={order.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="text-sm">
                          {order.foodDetails?.name || `Item #${order.item_id}`}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          x{order.quantity}
                        </span>
                        {addons.length > 0 && (
                          <div className="text-xs text-gray-400">
                            + {addons.map((a: any) => a.name).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          ₹{order.total_amount}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${orderStatus.bgColor} ${orderStatus.textColor}`}
                        >
                          {orderStatus.text}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </AccordionContent>
        <AccordionTrigger className="mx-auto p-0 min-[800px]:hidden my-2"></AccordionTrigger>
      </AccordionItem>
    </Accordion>
  )
}
