'use client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import CustomizedSteppers from './OrderStepper'
import { CookingPot, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Order } from '@/types/Order'
import UseOptimizeImage from '@/hooks/UseOptimizeImage'

interface UserOrdersListProps {
  orders: Order[]
}

import { parseImageString } from '@/helpers/imageParser'

export default function UserOrdersList({ orders }: UserOrdersListProps) {
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

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    return date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      // Only show date if not today, or always show?
      // User prompt said "keep these time based logic to the frontend only" implies matching previous behavior.
      ...(isToday
        ? {}
        : {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
    })
  }

  return (
    <div className="flex flex-col gap-5 mt-4">
      {orders.map((order) => {
        const {
          text: statusText,
          statusNumber,
          statusDescription,
          statusColor,
          bgColor,
          textColor,
          icon: statusIcon,
        } = getStatusDisplay(order.order_status)

        // ...

        // inside loop
        const foodDetails = order.foodDetails
        // Parse image string to get array, then take the first one
        const images = parseImageString(foodDetails?.img)
        const displayImage = images.length > 0 ? images[0] : null

        return (
          <Accordion key={order.id} type="single" collapsible className="">
            <div className="flex gap-5 items-center justify-between">
              {foodDetails?.preparation_time ? (
                <p className="text-xs text-gray-500 ml-2">
                  Prep time: {foodDetails.preparation_time} min
                </p>
              ) : (
                <p className="text-xs text-gray-500 ml-2">Prep time: 0 min</p>
              )}
              <p className="text-xs text-gray-500 mr-2">
                Ordered: {formatDate(order.created_at)}
              </p>
            </div>

            <AccordionItem
              value="item-1"
              className={`rounded-xl shadow-sm ${bgColor}`}
              style={{ border: `1px solid ${statusColor}` }}
            >
              <main className="flex gap-5 max-[600px]:gap-2 justify-between rounded-xl p-2">
                <section className="flex gap-5 max-[600px]:gap-2">
                  <div className="rounded-xl overflow-hidden h-[5rem] w-[5rem] border shrink-0 max-[350px]:w-[4rem] max-[350px]:h-[4rem] bg-gray-100 flex items-center justify-center">
                    {displayImage && (
                      <UseOptimizeImage
                        src={displayImage}
                        alt={foodDetails?.name}
                        width={100}
                        height={100}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="mt-2 max-[350px]:mt-0">
                    <div className="flex items-center gap-1">
                      <span className="max-[600px]:text-[.9rem]">
                        {foodDetails?.name || `Item #${order.item_id}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Quantity: x{order.quantity}
                    </p>

                    <h1 className="text-sm min-[800px]:hidden mt-2">
                      ₹{order.total_amount}
                    </h1>
                  </div>
                </section>

                <section className="flex gap-10 pt-2 max-[600px]:gap-2 max-[350px]:pt-0 max-[400px]:w-[8rem]">
                  <div className="max-[800px]:hidden borderd min-[800px]:w-[6rem]">
                    <h1 className="">₹{order.total_amount}</h1>
                    <p className="text-xs text-gray-500">
                      Payment: {order.payment_status}
                    </p>
                  </div>

                  {/* Status display section */}
                  <div className="borderd min-[800px]:w-[13rem]">
                    <div className="flex gap-1 items-center">
                      <span
                        style={{ backgroundColor: statusColor }}
                        className={`flex w-2 h-2 rounded-full`}
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
                    <div className="text-xs max-[600px]:text-[.6rem] text-gray-700 ml-3 mt-2  font-[500]">
                      Order ID: {order.id}
                    </div>
                  </div>
                  <AccordionTrigger className="max-[800px]:hidden"></AccordionTrigger>
                </section>
              </main>
              <AccordionContent className="p-5 border-t">
                <div>
                  <CustomizedSteppers
                    activeStep={statusNumber}
                    status={order.order_status}
                  />
                </div>
              </AccordionContent>
              <AccordionTrigger className="mx-auto p-0 min-[800px]:hidden my-2"></AccordionTrigger>
            </AccordionItem>
          </Accordion>
        )
      })}
    </div>
  )
}
