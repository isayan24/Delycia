import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useCustomerDetailsQuery } from '@/hooks/queries/useCRMQueries'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatISTDateTime } from '../order-history/utils/historyDateUtils'
import {
  ShoppingBag,
  Calendar,
  CheckCircle2,
  XCircle,
  Package,
} from 'lucide-react'
import { formatDateTime } from '@/utils/dateUtils'

interface CustomerDetailsSheetProps {
  customerId: string | null
  isOpen: boolean
  onClose: () => void
}

export default function CustomerDetailsSheet({
  customerId,
  isOpen,
  onClose,
}: CustomerDetailsSheetProps) {
  const { user } = useAdminAuthQuery()
  const rid = user?.selected_rid

  const { data: details, isLoading } = useCustomerDetailsQuery({
    rid: rid?.toString() || '',
    customerId,
  })
  const profile = details?.profile

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        {isLoading ? (
          <>
            <SheetHeader>
              <SheetTitle className="sr-only">
                Loading Customer Details
              </SheetTitle>
              <SheetDescription className="sr-only">
                Fetching customer information...
              </SheetDescription>
            </SheetHeader>
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </>
        ) : profile ? (
          <div className="space-y-6">
            <SheetHeader className="flex flex-row items-start gap-4 space-y-0">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.profile_pic || ''} />
                <AvatarFallback className="text-lg bg-orange-100 text-orange-600">
                  {profile.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <SheetTitle className="text-xl">{profile.name}</SheetTitle>
                <SheetDescription>
                  {profile.phone_number} • {profile.email || 'No email'}
                </SheetDescription>
                <div className="flex gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="bg-orange-50 text-orange-700 border-orange-200"
                  >
                    {profile.visit_count} Visits
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    ₹{profile.total_spent?.toLocaleString()} Spent
                  </Badge>
                </div>
              </div>
            </SheetHeader>

            <Separator />

            <div className="pl-4">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Order History
              </h3>
              <ScrollArea className="h-[calc(100vh-13rem)] pr-4">
                <div className="space-y-2">
                  {details?.history?.map((order) => {
                    // Treat 'settled' as completed
                    const isCompleted =
                      order.order_status === 'completed' ||
                      order.order_status === 'settled'
                    const isCancelled = order.order_status === 'cancelled'
                    // Display text: show 'Completed' for both completed and settled
                    const displayStatus = isCompleted
                      ? 'Completed'
                      : order.order_status

                    return (
                      <div
                        key={order.order_id}
                        className="relative pl-8 pb-8 border-l last:border-0 border-gray-100 ml-2"
                      >
                        <div
                          className={`absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                            isCompleted
                              ? 'bg-green-500'
                              : isCancelled
                                ? 'bg-red-500'
                                : 'bg-gray-300'
                          }`}
                        />

                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-base font-semibold text-gray-900">
                                Order #{order.order_id}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDateTime(order.created_at)}
                              </div>
                            </div>
                            <div className="text-right">
                              {order.discount_amount &&
                                order.discount_amount > 0 && (
                                  <div className="text-xs text-green-600 font-medium mb-0.5">
                                    -₹{order.discount_amount} discount
                                  </div>
                                )}
                              <OrderItemTotal
                                total={order.total_amount}
                                discount={order.discount_amount}
                              />
                              <div
                                className={`flex items-center justify-end gap-1.5 mt-1 text-xs font-medium capitalize ${
                                  isCompleted
                                    ? 'text-green-600'
                                    : isCancelled
                                      ? 'text-red-600'
                                      : 'text-gray-600'
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : isCancelled ? (
                                  <XCircle className="w-3.5 h-3.5" />
                                ) : (
                                  <Package className="w-3.5 h-3.5" />
                                )}
                                {displayStatus}
                              </div>
                            </div>
                          </div>

                          <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            {(() => {
                              let items = order.items
                              if (typeof items === 'string') {
                                try {
                                  items = JSON.parse(items)
                                } catch (e) {
                                  return order.items // Fallback to string if parse fails
                                }
                              }

                              if (!Array.isArray(items)) return null

                              return (
                                <div className="space-y-3">
                                  {items.map((item: any, idx: number) => (
                                    <div key={idx} className="text-sm">
                                      <div className="font-medium text-gray-900">
                                        {item.quantity} x {item.name}
                                        {item.variant_name && (
                                          <span className="text-gray-500 font-normal text-xs ml-1">
                                            ({item.variant_name})
                                          </span>
                                        )}
                                      </div>
                                      {item.addons &&
                                        item.addons.length > 0 && (
                                          <div className="ml-4 mt-1 space-y-0.5">
                                            {item.addons.map(
                                              (addon: any, aIdx: number) => (
                                                <div
                                                  key={aIdx}
                                                  className="text-xs text-gray-500 flex gap-1"
                                                >
                                                  <span>
                                                    + {addon.quantity}{' '}
                                                    {addon.name}
                                                  </span>
                                                  <span>(₹{addon.price})</span>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  ))}
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="sr-only">Customer Not Found</SheetTitle>
            </SheetHeader>
            <div className="text-center py-10 text-muted-foreground">
              Customer not found
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function OrderItemTotal({
  total,
  discount,
  taxPercent,
  taxAmount,
}: {
  total: number
  discount?: number
  taxPercent?: number | any
  taxAmount?: number | any
}) {
  const subtotal = total
  const discountValue = discount && discount > 0 ? discount : 0
  const taxValue = taxAmount && taxAmount > 0 ? taxAmount : 0
  const grandTotal = subtotal - discountValue

  return (
    <div className="text-right">
      <div className="text-base font-bold text-gray-900">
        ₹{grandTotal.toLocaleString()}
      </div>
      {taxValue > 0 && (
        <div className="text-xs text-gray-600 mt-0.5">+₹{taxValue} tax</div>
      )}
    </div>
  )
}
