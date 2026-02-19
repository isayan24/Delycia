// components/Checkout.tsx
'use client'

import { Form } from '@/components/ui/form'
import { checkoutSchema } from '@/schemas/checkoutSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from '@/lib/next-compat'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Utensils, ShoppingBag, Scan } from 'lucide-react'
import { useItemStore } from '@/store/order-store'
import CheckoutSidebar from './CheckoutSIdebar'
import PaymentButtons from './PaymentButtons'
import { useCheckoutMutation } from '@/hooks/mutations/useCheckoutMutation'
import EmptyCheckout from './EmptyCheckout'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import SpecialInstructionArea from './SpecialInstructionArea'
import { getCookie, setCookie } from 'cookies-next'
import useToast from '@/hooks/UseToast'
import { useLoginDialogStore } from '@/store/useLoginDialogStore'
import TableNotFoundCard from './TableNotFoundCard'
import { parseAndValidateQRCode } from '@/utils/qrCodeParser'
import QRCodeScanner from './QRCodeScanner'
import PartySizeSelector from './PartySizeSelector'
import { NameCollectionDialog } from '@/components/checkout/NameCollectionDialog'
import { useNameCollection } from '@/hooks/useNameCollection'
import { useTableQuery } from '@/hooks/queries/useTableQuery'
import { useRestaurantUsername } from '@/hooks/useRestaurantUsername'
import { useRestaurantByUsername } from '@/hooks/queries/useRestaurantsQuery'
import { useCheckoutTax } from '@/hooks/useCheckoutTax'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import RestaurantInactive from './RestaurantInactive'

type OrderType = 'dine_in' | 'takeaway'

export default function Checkout() {
  const showCartItems = useItemStore((state) => state.items)
  const selectedItems = useItemStore((state) => state.selectedItems)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const router = useRouter()

  // 1. Get username from local storage
  const username = useRestaurantUsername()

  // 2. Fetch restaurant details to get RID
  const { restaurant, loading: isRestaurantLoading } = useRestaurantByUsername(
    username || undefined,
  )
  const rid = restaurant?.id ? String(restaurant.id) : null

  const table = (getCookie('table') as string) || null
  const { showSuccess, showError } = useToast()
  const { openLoginDialog } = useLoginDialogStore()

  // 3. Fetch table details using derived RID
  const { table: tableDetails, isLoading: isTableLoading } = useTableQuery(
    rid,
    table,
  )

  const { user, isLoading } = useAuthQuery()

  // Name collection hook - production-ready approach
  const {
    needsName,
    showDialog: showNameDialog,
    openDialog: openNameDialog,
    closeDialog: closeNameDialog,
    handleNameCollected,
    userId,
  } = useNameCollection()

  // QR Scanner state management
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false)

  // Party size state
  const [partySize, setPartySize] = useState<number>(0)
  const [showPartySizeError, setShowPartySizeError] = useState(false)

  // Order Type State
  const [orderType, setOrderType] = useState<OrderType>('dine_in')

  // Initialize Order Type based on table and restaurant settings
  useEffect(() => {
    if (table) {
      setOrderType('dine_in')
    } else if (restaurant?.online_orders === 1) {
      setOrderType('takeaway')
    } else {
      setOrderType('dine_in') // Will be blocked by UI if no table
    }
  }, [table, restaurant?.online_orders])

  useEffect(() => {
    // No longer needed - useNameCollection handles name checking
  }, [user])

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      special_instruction: '',
      paymentMethod: 'cashOnDelivery',
    },
  })

  // mark filter item
  const { totalPrice, filteredCartItems } = useMemo(() => {
    const filteredCartItems = showCartItems.filter((item) =>
      selectedItems.includes(item.id),
    )
    const totalPrice = filteredCartItems.reduce(
      (acc, item) => acc + item.price * item.quantity!,
      0,
    )
    return { totalPrice, filteredCartItems }
  }, [showCartItems, selectedItems])

  // Tax calculation (UI-only — backend receives pre-tax totalPrice)
  const { taxPercent, taxAmount, grandTotal } = useCheckoutTax(totalPrice)

  const checkoutMutation = useCheckoutMutation()

  const processCheckout = async (values: any) => {
    setIsCheckoutLoading(true)
    try {
      const uid = user?.id
      if (!uid) {
        showError('Authentication Error', 'Please login again to continue')
        return
      }

      // Determine table_id based on order type
      // If takeaway, table_id should be null/undefined even if cookie exists
      const finalTableId =
        orderType === 'dine_in' ? tableDetails?.id : undefined
      const finalTable = orderType === 'dine_in' ? table : null

      await checkoutMutation.mutateAsync({
        rid,
        table: finalTable,
        table_id: finalTableId,
        paymentMethod: values.paymentMethod,
        special_instruction: values.special_instruction,
        orderItems: filteredCartItems,
        totalPrice: totalPrice,
        customer_id: uid,
        party_size: partySize,
        delivery_type: orderType,
      })

      showSuccess('Success', 'Order placed successfully')
      useItemStore.setState({
        items: showCartItems.filter((item) => !selectedItems.includes(item.id)),
        selectedItems: [],
      })
      router.push('/orders')
    } catch (err) {
      showError('Error in order', 'Failed to place order, please try again')
      console.error(err)
    } finally {
      setIsCheckoutLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    // Validate party size only for Dine In
    if (orderType === 'dine_in' && partySize === 0) {
      setShowPartySizeError(true)
      return
    }
    setShowPartySizeError(false)

    // Check if user is authenticated
    if (!user) {
      openLoginDialog()
      return
    }

    // Check if user needs to provide name
    if (needsName) {
      // Open name dialog with callback to proceed with checkout after name is collected
      openNameDialog(() => {
        processCheckout(values)
      })
      return
    }

    // User is authenticated and has name - proceed with checkout
    await processCheckout(values)
  }

  // Handle invalid QR scan
  const handleScanError = (error: string) => {
    console.error('QR scan error:', error)
  }

  // Handle successful QR scan
  const handleScanSuccess = (scannedData: string) => {
    try {
      // Parse and validate the scanned QR code data
      const validationResult = parseAndValidateQRCode(scannedData)

      if (!validationResult.isValid) {
        // Show error but keep scanner open
        const errorMsg = validationResult.error || 'Invalid QR code'
        handleScanError(errorMsg)
        showError(
          'Invalid QR Code',
          validationResult.error || 'Please scan a valid table QR code',
        )
        return
      }

      // Store validated table number in cookie
      if (validationResult.tableNumber) {
        setCookie('table', validationResult.tableNumber, { path: '/' })

        // Close scanner
        setShowQRScanner(false)

        // Show success message
        showSuccess(
          'Success',
          `Table ${validationResult.tableNumber} scanned successfully`,
        )

        // Refresh the page to update checkout view
        try {
          router.refresh()
        } catch {
          window.location.reload()
        }
      }
    } catch (error) {
      console.error('Error processing QR code:', error)
      showError('Error', 'Failed to process QR code. Please try again.')
    }
  }

  // Handle scanner close
  const handleScannerClose = () => {
    setShowQRScanner(false)
  }

  // Handle manual scanner trigger from TableNotFoundCard
  const handleOpenScanner = () => {
    setShowQRScanner(true)
  }

  // Guard: Check if restaurant is active (Placed after all hooks)
  if (!isRestaurantLoading && restaurant?.is_active === 0) {
    return <RestaurantInactive />
  }

  // Helper to determine if checkout should be disabled
  const isCheckoutDisabled =
    orderType === 'dine_in' && !table && restaurant?.online_orders !== 1
  return (
    <Form {...form}>
      {filteredCartItems.length === 0 ? (
        <EmptyCheckout />
      ) : (
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="p-4 md:p-8 space-y-6 mx-auto flex gap-8 max-[1550px]:flex-col relative max-[700px]:mb-28 max-w-[1600px]"
        >
          <section className="space-y-6 w-200 max-[1000px]:w-full">
            {/* Header Section */}
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-start max-sm:flex-col gap-2">
                <div className="space-y-3  w-[60%] max-[750px]:w-full">
                  <Button
                    variant="ghost"
                    type="button"
                    className="w-fit p-0 h-auto text-gray-400 hover:bg-transparent hover:text-orange-600 transition-colors group"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-2 transition-transform group-hover:-translate-x-1" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Back to Summary
                    </span>
                  </Button>

                  <div className="space-y-1 max-[640px]:hidden">
                    <h1 className="text-xl md:text-2xl font-[550] text-gray-900 tracking-tight leading-none">
                      Complete Order
                    </h1>
                    <p className="text-sm text-gray-400 font-medium max-w-sm">
                      Review your items and choose your preferred payment method
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-[40%] max-[750px]:w-full">
                  {table ? (
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden group hover:border-orange-200 transition-colors duration-300">
                      <div className="p-4 flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl shadow-xs transition-transform duration-500 group-hover:scale-110 ${orderType === 'dine_in' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}
                        >
                          {orderType === 'dine_in' ? (
                            <Utensils className="w-5 h-5" />
                          ) : (
                            <ShoppingBag className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em] leading-none mb-1.5">
                            {orderType === 'dine_in'
                              ? 'Dining at'
                              : 'Pickup From'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-gray-900 leading-none">
                              {orderType === 'dine_in'
                                ? `Table ${tableDetails?.table_number || table}`
                                : 'Takeaway'}
                            </span>
                            {orderType === 'dine_in' && tableDetails?.zone && (
                              <span className="px-1.5 py-0.5 rounded-md bg-orange-50 text-[9px] font-black text-orange-600 uppercase border border-orange-100">
                                {tableDetails.zone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {restaurant?.online_orders === 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setOrderType(
                              orderType === 'dine_in' ? 'takeaway' : 'dine_in',
                            )
                          }
                          className="w-full py-2.5 bg-gray-50/50 border-t border-gray-50 text-[11px] font-bold text-orange-600 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                        >
                          Switch to{' '}
                          {orderType === 'dine_in' ? 'Takeaway' : 'Dine In'}
                        </button>
                      )}
                    </div>
                  ) : restaurant?.online_orders === 1 ? (
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden group hover:border-blue-200 transition-colors duration-300">
                      <div className="p-4 flex items-center gap-4">
                        <div className="bg-blue-500 p-3 rounded-xl text-white shadow-xs group-hover:scale-110 transition-transform duration-500">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em] leading-none mb-1.5">
                            Order Type
                          </span>
                          <span className="text-base font-black text-gray-900 leading-none">
                            Takeaway
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenScanner}
                        className="w-full py-2.5 bg-blue-50/30 border-t border-blue-50 text-[11px] font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Scan className="w-3.5 h-3.5" />
                        Scan Table to Dine In
                      </button>
                    </div>
                  ) : (
                    <TableNotFoundCard onScanClick={handleOpenScanner} />
                  )}
                </div>
              </div>
            </div>

            {/* QR Scanner Dialog */}
            <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
              <DialogContent className="max-w-2xl p-0">
                <DialogHeader className="sr-only">
                  <DialogTitle>Scan QR Code</DialogTitle>
                  <DialogDescription>
                    Scan the table QR code to continue with your order
                  </DialogDescription>
                </DialogHeader>
                <QRCodeScanner
                  isOpen={showQRScanner}
                  onScanSuccess={handleScanSuccess}
                  onClose={handleScannerClose}
                  onScanError={handleScanError}
                />
              </DialogContent>
            </Dialog>

            <div className="flex gap-6 max-[1080px]:flex-col">
              <div className="flex flex-col gap-6 flex-1">
                {/* Party Size Selector - Only show for Dine In */}
                {orderType === 'dine_in' && (
                  <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm transition-all hover:shadow-md">
                    <PartySizeSelector
                      partySize={partySize}
                      setPartySize={setPartySize}
                      maxCapacity={tableDetails?.capacity}
                      showError={showPartySizeError}
                    />
                  </div>
                )}

                {/* Payment Buttons with enhanced styling */}
                <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm transition-all hover:shadow-md">
                  <PaymentButtons form={form} />
                </div>

                <SpecialInstructionArea form={form} />
              </div>

              <div className="w-[23rem] max-[1080px]:w-full">
                <CheckoutSidebar
                  totalPrice={totalPrice}
                  selectedItems={filteredCartItems}
                  isCheckoutLoading={
                    isCheckoutLoading || isLoading || isTableLoading
                  }
                  disableButton={
                    orderType === 'dine_in' && !table
                      ? true
                      : false /* Enable for takeaway */
                  }
                  taxPercent={taxPercent}
                  taxAmount={taxAmount}
                  grandTotal={grandTotal}
                />
              </div>
            </div>
          </section>

          {/* Name Collection Dialog - Production Ready */}
          {userId && (
            <NameCollectionDialog
              isOpen={showNameDialog}
              onClose={closeNameDialog}
              onSuccess={handleNameCollected}
              userId={userId}
            />
          )}
        </form>
      )}
    </Form>
  )
}
