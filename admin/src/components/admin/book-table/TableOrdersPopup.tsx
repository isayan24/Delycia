import { useState, useEffect } from 'react'
import { Users, CheckCircle2, IndianRupee } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTableOrdersQuery } from './hooks/useTableOrdersQuery'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useUpdateTableStatus } from './hooks/useUpdateTableStatus'
import { useSettleCustomerMutation } from './hooks/useSettleCustomerMutation'

interface TableOrdersPopupProps {
  isOpen: boolean
  onClose: () => void
  onRefresh?: () => void
  tableData: {
    id: number
    table_number: string
    zone: string
    status: string
    capacity?: number
    party_size?: number
  } | null
}

const getTimeAgo = (dateString: string) => {
  if (!dateString) return ''
  // Manually add 5.5 hours (IST offset) as parsed date is lagging
  const date = new Date(dateString)
  // Assuming the backend returns UTC, but user mentioned offset issues.
  // Sticking to existing logic found in file.
  const targetDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000)
  const now = new Date()
  const diffInMinutes = Math.floor(
    (now.getTime() - targetDate.getTime()) / 60000,
  )

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const hours = Math.floor(diffInMinutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function TableOrdersPopup({
  isOpen,
  onClose,
  onRefresh,
  tableData,
}: TableOrdersPopupProps) {
  const { user } = useAdminAuthQuery()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  )
  const updateTableStatusMutation = useUpdateTableStatus()
  const settleCustomerMutation = useSettleCustomerMutation({
    onSettled: () => {
      // Clear selection and trigger parent refresh
      setSelectedCustomerId(null)
      if (onRefresh) {
        onRefresh()
      }
    },
  })

  const { data: ordersResponse, isLoading } = useTableOrdersQuery({
    table_id: tableData ? tableData.id : 0,
    rid: user?.selected_rid?.toString() || '',
    enabled: isOpen && !!tableData && !!user?.selected_rid,
  })

  // Group orders by customer
  const customers = ordersResponse?.data || []

  // If selected customer leaves (e.g. status update), reset selection
  useEffect(() => {
    if (
      selectedCustomerId &&
      !customers.find((c) => c.customer_id === selectedCustomerId)
    ) {
      setSelectedCustomerId(null)
    }
  }, [customers, selectedCustomerId])

  if (!tableData) return null

  // Helpers for table visual
  const getTableIcon = (status: string) => {
    switch (status) {
      case 'occupied':
        return '🍽️'
      case 'reserved':
        return '📅'
      case 'available':
        return '✨'
      default:
        return '🍽️'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'border-orange-400 bg-orange-50 dark:bg-orange-950/20'
      case 'reserved':
        return 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
      case 'available':
        return 'border-green-400/50 bg-green-50/20 dark:bg-green-950/20'
      default:
        return 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'Occupied'
      case 'reserved':
        return 'Reserved'
      case 'available':
        return 'Available'
      default:
        return 'Empty'
    }
  }

  const handleMakeEmptyClick = () => setIsConfirmOpen(true)

  const handleConfirmMakeEmpty = () => {
    if (!tableData) return
    updateTableStatusMutation.mutate(
      {
        id: tableData.id,
        status: 'available',
        capacity: tableData.capacity,
        zone: tableData.zone,
      },
      {
        onSuccess: () => {
          setIsConfirmOpen(false)
          onClose()
        },
      },
    )
  }

  const handleAvatarClick = (customerId: number) => {
    if (selectedCustomerId === customerId) {
      setSelectedCustomerId(null) // Toggle off
    } else {
      setSelectedCustomerId(customerId)
    }
  }

  const selectedCustomer = customers.find(
    (c) => c.customer_id === selectedCustomerId,
  )

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="
          sm:max-w-[480px] 
          bg-transparent 
          border-none! 
          outline-none!
          shadow-none 
          ring-0
          p-0 
          overflow-visible
          max-[500px]:top-[10%] 
          max-[500px]:translate-y-0
        "
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">
            Table {tableData.table_number} Details
          </DialogTitle>
          <DialogDescription />

          <div className="relative flex flex-col items-center gap-4 sm:gap-6 animate-in zoom-in-95 duration-300">
            {/* 1. Table Visual Card (Centered & Popped) */}
            <div
              className={`
              w-48 sm:w-64 aspect-4/3 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center
              shadow-2xl sm:scale-110 transform transition-all relative
              ${getStatusColor(tableData.status)}
              ${tableData.status !== 'available' ? 'border-dashed border-2' : 'border'}
            `}
            >
              <div className="absolute top-4 right-4 opacity-50">
                {/* Decorative dots or pattern could go here */}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                {tableData.table_number}
              </div>
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                <div className="text-3xl sm:text-4xl">
                  {getTableIcon(tableData.status)}
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  {tableData.status === 'occupied' ? (
                    <span>
                      {tableData.party_size || customers.length || '-'}/
                      {tableData.capacity || 4}
                    </span>
                  ) : (
                    <span>{tableData.capacity || 4}</span>
                  )}
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                  {getStatusText(tableData.status)}
                </span>
              </div>
            </div>

            {/* 2. Avatar Row & Actions */}
            <div className="w-full flex items-center justify-center gap-1">
              {/* User Avatars */}
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
                ) : customers.length === 0 ? (
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                    <Users className="h-6 w-6" />
                  </div>
                ) : (
                  customers.map((customer) => (
                    <button
                      key={customer.customer_id}
                      onClick={() => handleAvatarClick(customer.customer_id)}
                      className={`
                          relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0.5 transition-all duration-300
                          ${
                            selectedCustomerId === customer.customer_id
                              ? 'ring-1 ring-orange-400 ring-offset-1 ring-offset-transparent scale-105 z-10'
                              : 'grayscale hover:grayscale-0 opacity-80 hover:opacity-100'
                          }
                        `}
                    >
                      <div className="h-full w-full rounded-full overflow-hidden bg-white shadow-md">
                        {customer.profile_pic ? (
                          <img
                            src={customer.profile_pic}
                            alt={customer.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                            {customer.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      {/* Selection Indicator Arrow - pointing down towards card */}
                      {selectedCustomerId === customer.customer_id && (
                        <div
                          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 
                              border-l-8 border-l-transparent
                              border-r-8 border-r-transparent
                              border-b-8 border-b-white dark:border-b-gray-900 z-50"
                        ></div>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Make Available Button - Circular/Pill style as per image */}
              {tableData.status !== 'available' && (
                <div className="h-12 sm:h-14 flex items-center ml-2">
                  <Button
                    onClick={handleMakeEmptyClick}
                    disabled={updateTableStatusMutation.isPending}
                    className="rounded-full h-10 sm:h-12 px-4 sm:px-6 bg-green-500 hover:bg-green-600 text-white shadow-lg border-2 border-white/20 text-sm sm:text-base"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Make Available
                  </Button>
                </div>
              )}
            </div>

            {/* 3. Selected User Details Card (Absolute Positioning for Stability) */}
            {selectedCustomer && (
              <div
                className="absolute top-full lg:left-0 lg:right-0 mt-2 w-full max-w-md mx-auto z-50 animate-in fade-in slide-in-from-top-4 duration-300"
                style={{
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  left: 0,
                  right: 0,
                }}
              >
                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800">
                  {/* User Header */}
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {selectedCustomer.name}
                      </h3>
                      <p className="text-orange-500 text-xs sm:text-sm font-medium mt-0.5 sm:mt-1">
                        {
                          selectedCustomer.orders.filter(
                            (o) => o.order_status !== 'cancelled',
                          ).length
                        }{' '}
                        Items Ordered
                      </p>
                    </div>
                    {/* Time */}
                    <div className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                      {getTimeAgo(selectedCustomer.orders[0]?.created_at)}
                    </div>
                  </div>

                  {/* Order List */}
                  <ScrollArea className="max-h-[250px] pr-2">
                    <div className="space-y-4">
                      {selectedCustomer.orders
                        .filter((o) => o.order_status !== 'cancelled')
                        .map((order) => (
                          <div
                            key={order.id}
                            className="group flex flex-col border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0 last:pb-0"
                          >
                            <div className="flex justify-between items-start w-full">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {order.item_name}
                                  </span>
                                  {order.quantity > 1 && (
                                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                      x{order.quantity}
                                    </span>
                                  )}
                                  {order.order_status === 'completed' && (
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                      Delivered
                                    </span>
                                  )}
                                </div>
                                {order.variant_name && (
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    Variant: {order.variant_name}
                                  </div>
                                )}
                              </div>
                              {/* Price - Shown on Hover */}
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                ₹{order.total_amount}
                              </div>
                            </div>

                            {/* Addons */}
                            {order.addons &&
                              Array.isArray(order.addons) &&
                              order.addons.length > 0 && (
                                <div className="mt-2 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                                  {order.addons.map(
                                    (addon: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="text-xs text-gray-500 flex justify-between"
                                      >
                                        <span>
                                          + {addon.name}{' '}
                                          {addon.quantity > 1
                                            ? `(x${addon.quantity})`
                                            : ''}
                                        </span>
                                        <span className="opacity-0 group-hover:opacity-60 transition-opacity">
                                          ₹{addon.price}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}

                            {/* Special Instructions */}
                            {order.special_instructions && (
                              <div className="mt-1 text-[10px] text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded w-fit italic">
                                "{order.special_instructions}"
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </ScrollArea>

                  {/* Settle Customer Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      onClick={() => {
                        if (selectedCustomer && tableData) {
                          settleCustomerMutation.mutate({
                            customerId: selectedCustomer.customer_id,
                            tableId: tableData.id,
                            restaurantId: user?.selected_rid || '',
                          })
                        }
                      }}
                      disabled={settleCustomerMutation.isPending}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                    >
                      <IndianRupee className="h-4 w-4 mr-2" />
                      {settleCustomerMutation.isPending
                        ? 'Settling...'
                        : 'Settle & Remove Customer'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Close Button if no customer selected or empty */}
            {!selectedCustomer && !isLoading && customers.length === 0 && (
              <div className="w-full flex justify-center">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  Close Popup
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Make Table Available?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear the table status. Ensure all bills are settled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmMakeEmpty}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
