// components/Checkout.tsx
'use client'

import { Form } from '@/components/ui/form'
import { checkoutSchema } from '@/schemas/checkoutSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from '@/lib/next-compat'
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
import { useRestaurantUsername } from '@/hooks/useRestaurantUsername' // Import hook
import { useRestaurantByUsername } from '@/hooks/queries/useRestaurantsQuery' // Import hook
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function Checkout() {
  const showCartItems = useItemStore((state) => state.items)
  const selectedItems = useItemStore((state) => state.selectedItems)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const router = useRouter()

  // 1. Get username from local storage
  const username = useRestaurantUsername()

  // 2. Fetch restaurant details to get RID
  const { restaurant } = useRestaurantByUsername(username || undefined)
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

  const checkoutMutation = useCheckoutMutation()

  const processCheckout = async (values: any) => {
    setIsCheckoutLoading(true)
    try {
      const uid = user?.id
      if (!uid) {
        showError('Authentication Error', 'Please login again to continue')
        return
      }
      await checkoutMutation.mutateAsync({
        rid,
        table,
        table_id: tableDetails?.id, // Pass table_id
        paymentMethod: values.paymentMethod,
        special_instruction: values.special_instruction,
        orderItems: filteredCartItems,
        totalPrice: totalPrice,
        customer_id: uid,
        party_size: partySize,
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
    // Validate party size first
    if (partySize === 0) {
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

  return (
    <Form {...form}>
      {filteredCartItems.length === 0 ? (
        <EmptyCheckout />
      ) : (
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="p-5 space-y-6 mx-auto flex gap-10 max-[1550px]:flex-col relative max-[700px]:mb-28"
        >
          <section className="space-y-2 w-[50rem] max-[1000px]:w-full">
            <div
              className={` items-center ${table ? 'flex justify-between' : 'flex flex-col gap-2'}`}
            >
              <h1 className="text-lg font-semibold ml-0">
                Complete Your Order
              </h1>

              <div className="w-fit">
                {table ? (
                  <div className="mt-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      {tableDetails && (
                        <>
                          <span className="font-medium">Table Number:</span>{' '}
                          {tableDetails.table_number}
                          <span className="mx-2">|</span>
                          <span className="font-medium">Zone:</span>{' '}
                          {tableDetails.zone}
                          {/* <span className="mx-2">|</span> */}
                          {/* <span className="font-medium">Capacity:</span> {tableDetails.capacity} */}
                        </>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="w-full">
                    <TableNotFoundCard onScanClick={handleOpenScanner} />
                  </div>
                )}
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
            </div>

            <div className="flex gap-4 max-[890px]:flex-col flex-wrap">
              <div className="flex gap-4 flex-col">
                {/* Party Size Selector */}
                <div className="p-4 border rounded-lg bg-white">
                  <PartySizeSelector
                    partySize={partySize}
                    setPartySize={setPartySize}
                    showError={showPartySizeError}
                  />
                </div>
                <PaymentButtons form={form} />
                <SpecialInstructionArea form={form} />
              </div>

              <CheckoutSidebar
                totalPrice={totalPrice}
                selectedItems={filteredCartItems}
                isCheckoutLoading={
                  isCheckoutLoading || isLoading || isTableLoading
                }
                disableButton={table ? false : true}
              />
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
