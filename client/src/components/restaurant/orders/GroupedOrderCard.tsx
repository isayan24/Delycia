'use client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import CustomizedSteppers from './OrderStepper'
import {
  CookingPot,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Receipt,
} from 'lucide-react'
import { GroupedUserOrder, Order } from '@/types/Order'
import UseOptimizeImage from '@/hooks/UseOptimizeImage'
import { parseImageString } from '@/helpers/imageParser'
import { safeJsonParse } from '@/helpers/jsonParser'
import { formatDateTimeIST } from '@/utils/dateUtils'
import { useRestaurantQuery } from '@/hooks/queries/useRestaurantsQuery'
import { calculateTax } from '@/lib/tax/taxCalculator'

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

// Get all unique images from all orders in the group
const getGroupImages = (orders: Order[]): string[] => {
  const allImages: string[] = []
  orders.forEach((order) => {
    const images = parseImageString(order.foodDetails?.img)
    if (images.length > 0) {
      // Add each image if it's not already in the list
      images.forEach((img) => {
        if (!allImages.includes(img)) allImages.push(img)
      })
    }
  })
  return allImages
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
    statusColor,
    bgColor,
    textColor,
    icon: statusIcon,
  } = getStatusDisplay(aggregatedStatus)

  const groupImages = getGroupImages(orders)
  const maxPrepTime = getMaxPrepTime(orders)
  const firstOrder = orders[0]

  // 1. Fetch restaurant for tax calculation
  const { restaurant } = useRestaurantQuery(firstOrder?.rid)

  // 2. Calculate tax based on restaurant settings
  const taxResult = calculateTax(totalAmount, restaurant?.tax_percent ?? 0)
  const { taxPercent, taxAmount, grandTotal } = taxResult

  // Format cart ID for display (uppercase, truncate if needed)
  const displayCartId = cart_id.startsWith('single-')
    ? `#${cart_id.replace('single-', '')}`
    : cart_id.toUpperCase()

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1" className="border-none mb-4">
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <main className="p-4 md:p-6">
            {/* Top Header: Order ID & Time */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mr-1.5">
                    OrderID
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    {displayCartId}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span className="text-[11px] font-medium">
                    {formatDateTimeIST(firstOrder?.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {maxPrepTime > 0 && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full border border-orange-100">
                    <Clock className="h-3 w-3" />
                    <span className="text-[11px] font-bold uppercase tracking-tight">
                      {maxPrepTime} min
                    </span>
                  </div>
                )}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${bgColor} ${textColor}`}
                  style={{ borderColor: statusColor }}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {statusText}
                  </span>
                  {statusIcon}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:items-center">
              {/* Image Gallery Stack */}
              <div className="flex items-center">
                <div className="flex -space-x-4">
                  {groupImages.slice(0, 3).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-sm bg-gray-50 shrink-0"
                    >
                      <UseOptimizeImage
                        src={img}
                        alt={`Item ${idx + 1}`}
                        width={100}
                        height={100}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                  {groupImages.length > 3 && (
                    <div className="relative w-20 h-20 rounded-2xl bg-gray-800 border-4 border-white shadow-sm flex items-center justify-center text-white text-sm font-bold shrink-0">
                      +{groupImages.length - 3}
                    </div>
                  )}
                  {groupImages.length === 0 && (
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-100 flex items-center justify-center text-gray-300">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                </div>
              </div>

              {/* Items Preview */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                    {firstOrder?.foodDetails?.name || 'Loading item...'}
                    {firstOrder && (
                      <span className="ml-2 text-gray-400 font-medium text-sm">
                        x{firstOrder.quantity}
                      </span>
                    )}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Package className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">
                      {orderCount} {orderCount === 1 ? 'item' : 'items'} total
                    </span>
                  </div>
                  {orderCount > 1 && (
                    <p className="text-xs text-gray-400 italic">
                      Including{' '}
                      {orders
                        .slice(1)
                        .map((o) => o.foodDetails?.name)
                        .join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Pricing & Trigger */}
              <div className="flex md:flex-col items-end justify-between md:justify-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-300 mb-1 leading-none">
                    Total Pay
                  </span>
                  <span className="text-2xl font-black text-gray-900 tracking-tight">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
                <AccordionTrigger className="w-full md:w-auto p-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  <div className="bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl border border-gray-100 transition-colors flex items-center gap-2 text-xs font-bold text-gray-600">
                    Details
                  </div>
                </AccordionTrigger>
              </div>
            </div>
          </main>

          <AccordionContent className="bg-gray-50/50 border-t border-gray-50 p-6 md:p-8">
            <div className="mb-10">
              <CustomizedSteppers
                activeStep={statusNumber}
                status={aggregatedStatus}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Individual Items List */}
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-4 px-1">
                  Order Details
                </h4>
                <div className="space-y-3">
                  {orders.map((order) => {
                    const addons = safeJsonParse(order.addons, [])
                    const orderStatus = getStatusDisplay(order.order_status)

                    return (
                      <div
                        key={order.id}
                        className="flex justify-between items-start p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
                      >
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800 text-sm">
                              {order.foodDetails?.name ||
                                `Item #${order.item_id}`}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg font-bold">
                                x{order.quantity}
                              </span>
                              <span className="text-xs text-gray-400">
                                ₹{order.total_amount}
                              </span>
                            </div>
                            {addons.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {addons.map((a: any, i: number) => (
                                  <span
                                    key={i}
                                    className="text-[10px] bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-md font-medium"
                                  >
                                    + {a.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${orderStatus.bgColor} ${orderStatus.textColor}`}
                          style={{ borderColor: orderStatus.statusColor }}
                        >
                          {orderStatus.text}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Bill Summary */}
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-4 px-1">
                    Bill Summary
                  </h4>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        Subtotal
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </div>

                    {taxPercent > 0 && (
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">
                            GST ({taxPercent}%)
                          </span>
                          <span className="text-[10px] text-gray-400 italic font-medium">
                            Inclusive of all taxes
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                          + ₹{taxAmount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900">
                          Total Paid
                        </span>
                        <span className="text-[10px] text-green-500 font-bold uppercase tracking-tight">
                          Payment {firstOrder?.payment_status}
                        </span>
                      </div>
                      <span className="text-xl font-black text-gray-900">
                        ₹{grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-gray-100/50 rounded-2xl p-4 border border-gray-100">
                    <span className="text-[9px] uppercase tracking-wider font-black text-gray-400 block mb-1">
                      Payment Method
                    </span>
                    <span className="text-xs font-bold text-gray-700 uppercase">
                      {firstOrder?.payment_method?.replace(/([A-Z])/g, ' $1') ||
                        'N/A'}
                    </span>
                  </div>
                  <div className="flex-1 bg-gray-100/50 rounded-2xl p-4 border border-gray-100">
                    <span className="text-[9px] uppercase tracking-wider font-black text-gray-400 block mb-1">
                      Order Type
                    </span>
                    <span className="text-xs font-bold text-gray-700 uppercase">
                      {firstOrder?.delivery_type || 'Dine-In'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  )
}
