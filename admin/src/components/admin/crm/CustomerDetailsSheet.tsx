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
import {
  ShoppingBag,
  Calendar,
  CheckCircle2,
  XCircle,
  Users,
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
      <SheetContent className="w-full sm:max-w-[540px] p-0 border-l-[#ead9cd] dark:border-l-primary/10 gap-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="h-10 w-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] animate-pulse">
              Syncing profile...
            </p>
          </div>
        ) : profile ? (
          <ScrollArea className="h-full bg-slate-50/50 dark:bg-[#1a110c]">
            <div className="flex flex-col min-h-full">
              {/* Header Section */}
              <div className="p-6 px-2 bg-white dark:bg-[#2d1e14] border-b border-[#ead9cd] dark:border-primary/5">
                <SheetHeader className="flex flex-row gap-4 space-y-0">
                  <Avatar className="h-16 w-16 lg:h-20 lg:w-20 border-2 border-white dark:border-[#3a291d] shadow-sm">
                    <AvatarImage src={profile.profile_pic || ''} />
                    <AvatarFallback className="text-xl bg-orange-50 dark:bg-[#3a291d] text-orange-600 font-medium uppercase">
                      {profile.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <SheetTitle className="text-lg lg:text-[22px] font-medium text-slate-900 dark:text-white truncate">
                      {profile.name}
                    </SheetTitle>
                    <SheetDescription className="text-xs lg:text-sm text-[#a16b45] font-semibold mt-1 flex flex-wrap gap-x-2 gap-y-1">
                      <span>{profile.phone_number}</span>
                      <span className="opacity-30">•</span>
                      {profile.email ? (
                        <span className="truncate">{profile.email}</span>
                      ) : (
                        <span></span>
                      )}
                    </SheetDescription>
                    <div className="flex gap-2 mt-4">
                      <Badge className="bg-orange-50 dark:bg-orange-900/10 text-nowrap text-orange-600 border-none text-[10px] lg:text-[12px] font-black uppercase px-2 py-0.5">
                        {profile.visit_count} Visits
                      </Badge>
                      <Badge className="bg-emerald-50 dark:bg-emerald-900/10 text-nowrap text-emerald-600 border-none text-[10px] lg:text-[12px] font-black uppercase px-2 py-0.5">
                        ₹{profile.total_spent?.toLocaleString('en-IN')} Spent
                      </Badge>
                    </div>
                  </div>
                </SheetHeader>
              </div>

              {/* History Section Container */}
              <div className="flex-1 flex flex-col">
                <div className="px-6 py-4 flex items-center justify-between bg-white dark:bg-[#2d1e14]/50 border-b border-[#ead9cd] dark:border-primary/5 shrink-0">
                  <h3 className="text-[10px] lg:text-xs font-black text-[#a16b45] uppercase tracking-[0.15em] flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Activity History
                  </h3>
                  <span className="text-[10px] font-bold text-[#a16b45]/40 italic">
                    Showing last {details?.history?.length || 0} orders
                  </span>
                </div>

                <div className="p-6">
                  <div className="space-y-0 relative">
                    {/* Vertical line for the timeline */}
                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[#ead9cd] dark:bg-primary/10 opacity-50" />

                    {details?.history?.map((order) => {
                      const isCompleted =
                        order.order_status === 'completed' ||
                        order.order_status === 'settled'
                      const isCancelled = order.order_status === 'cancelled'
                      const displayStatus = isCompleted
                        ? 'Completed'
                        : order.order_status

                      return (
                        <div
                          key={order.order_id}
                          className="relative pl-9 pb-8 last:pb-2 group"
                        >
                          {/* Timeline Dot */}
                          <div
                            className={`absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 border-white dark:border-[#1a110c] z-10 transition-transform group-hover:scale-110 flex items-center justify-center ${
                              isCompleted
                                ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                : isCancelled
                                  ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                                  : 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.3)]'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            ) : isCancelled ? (
                              <XCircle className="w-3 h-3 text-white" />
                            ) : (
                              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            )}
                          </div>

                          <div className="bg-white dark:bg-[#2d1e14] rounded-2xl p-4 lg:p-5 border border-[#ead9cd] dark:border-primary/10 shadow-sm group-hover:border-orange-200 dark:group-hover:border-primary/20 transition-all">
                            <div className="flex justify-between items-start gap-4">
                              <div className="min-w-0">
                                <div className="text-[13px] lg:text-[15px] font-medium text-slate-900 dark:text-white">
                                  Order #{order.order_id}
                                </div>
                                <div className="text-[10px] lg:text-xs text-[#a16b45] font-semibold flex items-center gap-1.5 mt-1">
                                  <Calendar className="w-3.5 h-3.5 opacity-50" />
                                  {formatDateTime(order.created_at)}
                                </div>
                              </div>
                              <div className="text-right">
                                <OrderItemTotal
                                  total={order.total_amount}
                                  discount={order.discount_amount}
                                />
                                <div
                                  className={`text-[10px] lg:text-[11px] font-black uppercase tracking-wider mt-1.5 flex items-center justify-end gap-1 ${
                                    isCompleted
                                      ? 'text-emerald-600'
                                      : isCancelled
                                        ? 'text-red-600'
                                        : 'text-orange-600'
                                  }`}
                                >
                                  {displayStatus}
                                </div>
                              </div>
                            </div>

                            {/* Items Preview */}
                            <div className="mt-4 pt-4 border-t border-[#ead9cd]/30 dark:border-primary/5">
                              {(() => {
                                let items = order.items
                                if (typeof items === 'string') {
                                  try {
                                    items = JSON.parse(items)
                                  } catch (e) {
                                    return (
                                      <p className="text-xs text-[#a16b45]">
                                        {order.items}
                                      </p>
                                    )
                                  }
                                }

                                if (!Array.isArray(items)) return null

                                return (
                                  <div className="space-y-3">
                                    {items.map((item: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between items-start"
                                      >
                                        <div className="min-w-0 flex-1">
                                          <p className="text-xs lg:text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                                            <span className="text-orange-600 font-black mr-1">
                                              {item.quantity}x
                                            </span>
                                            {item.name}
                                          </p>
                                          {item.addons &&
                                            item.addons.length > 0 && (
                                              <div className="ml-5 mt-1">
                                                {item.addons.map(
                                                  (
                                                    addon: any,
                                                    aIdx: number,
                                                  ) => (
                                                    <p
                                                      key={aIdx}
                                                      className="text-[10px] text-[#a16b45] font-medium opacity-70"
                                                    >
                                                      + {addon.name} (₹
                                                      {addon.price})
                                                    </p>
                                                  ),
                                                )}
                                              </div>
                                            )}
                                        </div>
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
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Users className="h-12 w-12 text-[#a16b45]/20 mb-4" />
            <p className="text-xs font-black text-[#a16b45] uppercase tracking-widest">
              Profile not detected or database out of sync
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function OrderItemTotal({
  total,
  discount,
}: {
  total: number
  discount?: number
}) {
  const subtotal = total
  const discountValue = discount && discount > 0 ? discount : 0
  const grandTotal = subtotal - discountValue

  return (
    <div className="text-right">
      <div className="text-[14px] lg:text-[16px] font-black text-slate-900 dark:text-white">
        ₹{grandTotal.toLocaleString('en-IN')}
      </div>
      {discountValue > 0 && (
        <p className="text-[9px] lg:text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">
          Saved ₹{discountValue.toLocaleString()}
        </p>
      )}
    </div>
  )
}
