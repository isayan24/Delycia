// components/Checkout.tsx
'use client'

import { NameInputStep } from '@/components/steps/NameInputStep'
import { ThemeColors } from '@/types/loginTypes'

import { Form } from '@/components/ui/form'
import { checkoutSchema } from '@/schemas/checkoutSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from '@/lib/next-compat'
import { useItemStore } from '@/store/order-store'
import CheckoutSidebar from './CheckoutSIdebar'
import axios from 'axios'
import PaymentButtons from './PaymentButtons'
import EmptyCheckout from './EmptyCheckout'
import { useAuthContext } from '@/context/AuthProvider'
import SpecialInstructionArea from './SpecialInstructionArea'
import { getCookie, setCookie } from 'cookies-next'
import useToast from '@/hooks/UseToast'
import { useLoginDialogStore } from '@/store/useLoginDialogStore'
import { getUser } from '@/helpers/getUser'
import TableNotFoundCard from './TableNotFoundCard'
import { parseAndValidateQRCode } from '@/utils/qrCodeParser'
import QRCodeScanner from './QRCodeScanner'
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
  const rid = getCookie('rid')
  const table = getCookie('table')
  const { showSuccess, showError } = useToast()
  const [userDetails, setUserDetails] = useState<any>({})
  const { openLoginDialog, openLoginDialogWithCheckout } = useLoginDialogStore()

  const { user, getValidAccessToken, isLoading } = useAuthContext()

  console.log(user, 'user \n\n\n\n\n\n')

  // QR Scanner state management
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false)
  const [scannerError, setScannerError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const getUserDetails = async () => {
        const accessToken = await getValidAccessToken()
        if (accessToken) {
          const userData = await getUser(accessToken)
          setUserDetails(userData?.user)
        }
      }
      getUserDetails()
    }
  }, [user, getValidAccessToken])

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

  const handleCheckoutComplete = async (userData: any) => {
    try {
      const accessToken = await getValidAccessToken()
      const response = await axios.post('/api/user/update', {
        uid: user?._id,
        name: userData.fullName,
        username:
          userData.fullName.toLowerCase().replace(/\s+/g, '') +
          user?.phone_number?.slice(-2),
        accessToken: accessToken,
      })

      if (response.status === 200) {
        setUserDetails((prev: any) => ({ ...prev, name: userData.fullName }))
        const currentValues = form.getValues()
        await processCheckout(currentValues)
      }
    } catch (error) {
      console.error('Error updating user data:', error)
      showError('Error', 'Failed to update user data. Please try again.')
    }
  }

  const processCheckout = async (values: any) => {
    setIsCheckoutLoading(true)
    try {
      const accessToken = await getValidAccessToken()
      if (!accessToken) {
        showError('Authentication Error', 'Please login again to continue')
        return
      }
      console.log(values, 'values checkout \n\n\n')
      await axios
        .post('/api/restaurant/checkout', {
          rid,
          table,
          paymentMethod: values.paymentMethod,
          special_instruction: values.special_instruction,
          orderItems: filteredCartItems,
          totalPrice: totalPrice,
          customer_id: user?.id,
          accessToken,
        })
        .then(() => {
          showSuccess('Success', 'Order placed successfully')
          useItemStore.setState({
            items: showCartItems.filter(
              (item) => !selectedItems.includes(item.id),
            ),
            selectedItems: [],
          })
          router.push('/orders')
        })
        .catch((err) => {
          showError('Error in order', 'Failed to place order, please try again')
          console.log(err)
        })
    } finally {
      setIsCheckoutLoading(false)
    }
  }

  // Placeholder theme for NameInputStep
  const defaultTheme: ThemeColors = {
    primary: 'from-orange-500 to-orange-600',
    primaryHover: 'hover:from-orange-600 hover:to-orange-700',
    accent: 'bg-orange-500',
    accentHover: 'hover:bg-orange-600',
    ring: 'focus:ring-2 focus:ring-orange-500',
    border: 'border-orange-200',
    bg: 'bg-orange-50',
  }

  const [showNameInput, setShowNameInput] = useState(false)
  const [fullName, setFullName] = useState('')

  const handleNameSubmit = async () => {
    if (!fullName.trim()) return
    await handleCheckoutComplete({ fullName })
    setShowNameInput(false)
  }

  const handleSubmit = async (values: any) => {
    if (!user) {
      console.log('no user found \n\n\n')
      openLoginDialog()
      console.log(
        'No user found, maybe for network issue, or actually not exist!!',
      )
    } else if (values && userDetails?.name) {
      console.log(values, 'values checkout \n\n\n')
      await processCheckout(values)
    } else {
      // User exists but name is missing
      setShowNameInput(true)
    }
  }

  // Note: We keep handleTableSet in case you later add a small flow to set the cookie.
  const handleTableSet = (t: string) => {
    setCookie('table', t, { path: '/' })
    try {
      router.refresh()
    } catch {
      window.location.reload()
    }
  }

  // Handle invalid QR scan
  const handleScanError = (error: string) => {
    setScannerError(error)
    console.error('QR scan error:', error)
  }

  // Handle successful QR scan
  const handleScanSuccess = (scannedData: string) => {
    try {
      // Parse and validate the scanned QR code data
      console.log('Scanned data:', scannedData)
      const validationResult = parseAndValidateQRCode(scannedData)

      if (!validationResult.isValid) {
        // Show error but keep scanner open
        const errorMsg = validationResult.error || 'Invalid QR code'
        setScannerError(errorMsg)
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
        setScannerError(null)

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
      setScannerError('Failed to process QR code')
      showError('Error', 'Failed to process QR code. Please try again.')
    }
  }

  // Handle scanner close
  const handleScannerClose = () => {
    setShowQRScanner(false)
    setScannerError(null)
  }

  // Handle manual scanner trigger from TableNotFoundCard
  const handleOpenScanner = () => {
    setShowQRScanner(true)
    setScannerError(null)
  }

  return (
    <Form {...form}>
      {filteredCartItems.length === 0 ? (
        <EmptyCheckout />
      ) : (
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="p-5 space-y-6 mx-auto flex gap-10 max-[1550px]:flex-col relative max-[700px]:mb-[7rem]"
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
                      <span className="font-medium">Table Number:</span> {table}
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
                <PaymentButtons form={form} />
                <SpecialInstructionArea form={form} />
              </div>

              <CheckoutSidebar
                totalPrice={totalPrice}
                selectedItems={filteredCartItems}
                isCheckoutLoading={isCheckoutLoading || isLoading}
                disableButton={table ? false : true}
              />
            </div>
          </section>

          {/* Name Input Dialog */}
          <Dialog open={showNameInput} onOpenChange={setShowNameInput}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Complete Profile</DialogTitle>
                <DialogDescription>
                  Please enter your name to complete the order.
                </DialogDescription>
              </DialogHeader>
              <NameInputStep
                fullName={fullName}
                setFullName={setFullName}
                isLoading={isCheckoutLoading}
                theme={defaultTheme}
                onSubmit={handleNameSubmit}
                onEditPhone={() => setShowNameInput(false)}
              />
            </DialogContent>
          </Dialog>
        </form>
      )}
    </Form>
  )
}
