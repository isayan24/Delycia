import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Phone,
  Check,
  MessageSquare,
  Plus,
  Tag,
  ChevronLeft,
  Receipt,
  MapPin,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { useTableStore } from '@/store/useTableStore'
import axios from 'axios'
import useToast from '@/hooks/UseToast'
import { useAuth } from '@/hooks/useAuth'
import { useCustomerSearch, UserSearchResult } from './hooks/useCustomerSearch'
import { CustomerSearchDropdown } from './CustomerSearchDropdown'
import { generateUsername } from '@/helpers/user/generateUsername'
import ThermalBill from '@/components/billing/ThermalBill'
import type { BillData } from '@/components/billing'
import { handleShareToMobile } from '@/components/billing'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useOrderTaxCalculation } from '@/hooks/useOrderTaxCalculation'
import { formatDateTime } from '@/utils/dateUtils'

interface CustomerDetails {
  name: string
  phone_number: string
  username: string
}

export default function AddCustomerDetails() {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    phone_number: '',
    username: '',
  })
  const [errors, setErrors] = useState<Partial<CustomerDetails>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSpecialInstructions, setShowSpecialInstructions] = useState(false)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Thermal Bill Popup state
  const [showThermalBill, setShowThermalBill] = useState(false)
  const [billData, setBillData] = useState<BillData | null>(null)

  const {
    changeState,
    table,
    orderItems,
    getTotalAmount,
    clearAllItems,
    refetchTables,
    partySize,
  } = useTableStore()

  const { showError, showSuccess } = useToast()
  const { user } = useAuth()
  const { selectedRestaurant } = useRestaurantSelector()

  // Use custom search hook
  const { searchResults, isSearching, searchError, clearResults } =
    useCustomerSearch(customerDetails.name, user?.selected_rid)

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleUserSelect = (user: UserSearchResult) => {
    setCustomerDetails({
      name: user.name,
      phone_number: user.phone_number,
      username: user.username,
    })
    setShowSearchResults(false)
    clearResults()
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerDetails> = {}

    if (!customerDetails.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (customerDetails.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!customerDetails.phone_number.trim()) {
      newErrors.phone_number = 'Mobile number is required'
    } else if (!/^[5-9]\d{9}$/.test(customerDetails.phone_number.trim())) {
      newErrors.phone_number = 'Please enter a valid 10-digit mobile number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      }

      if (field === 'name') {
        updated.username = generateUsername(value)
      }

      return updated
    })

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const [discount, setDiscount] = useState<number>(0)

  const subtotal = getTotalAmount()
  const validatedDiscount = Math.max(0, Math.min(discount, subtotal))

  const {
    grandTotal,
    taxAmount,
    taxPercent,
    isLoading: isTaxLoading,
  } = useOrderTaxCalculation({
    subtotal,
    discountAmount: validatedDiscount,
  })

  const finalAmount = grandTotal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const discountPerItem =
        orderItems.length > 0 ? validatedDiscount / orderItems.length : 0

      const orderData = {
        customerDetails,
        specialInstructions,
        orderItems: orderItems.map((item) => ({
          ...item,
          id: item.id.toString().includes('_')
            ? item.id.toString().split('_')[0]
            : item.id,
          variantId: item.variantId ? parseInt(item.variantId) : 0,
          discount_amount: discountPerItem,
        })),
        totalAmount: finalAmount,
        table,
        partySize,
        order_status: 'processing',
      }
      await axios.post('/api/waiter-orders', orderData)
      showSuccess('Success', 'Order placed successfully')

      // Prepare bill data for thermal printer
      const thermalBillData: BillData = {
        orderId: `TBL-${table?.table_number || 'N/A'}`,
        restaurantName: '',
        tableNo: table?.table_number || 'N/A',
        tableZone: table?.zone,
        customerName: customerDetails.name,
        customerPhone: customerDetails.phone_number,
        items: orderItems.map((item) => ({
          name: item.name || 'Unknown Item',
          quantity: item.quantity || 1,
          price: (item.price || 0) * (item.quantity || 1),
          addons: item.addons,
        })),
        totalAmount: subtotal,
        discountAmount: validatedDiscount > 0 ? validatedDiscount : undefined,
        orderDate: formatDateTime(new Date()),
        paymentMethod: 'Pending',
        paymentStatus: 'Pending',
        specialInstructions: specialInstructions,
      }
      setBillData(thermalBillData)
      setShowThermalBill(true)

      setCustomerDetails({ name: '', phone_number: '', username: '' })
      setDiscount(0)
      clearAllItems()
      changeState(0)

      try {
        await refetchTables()
      } catch (refetchError) {
        console.error('Error refetching tables:', refetchError)
      }
    } catch (error) {
      console.error('Error submitting order:', error)
      showError('Error', 'Error submitting order try again')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#fcfcfd] dark:bg-gray-950">
      {/* Thermal Bill Popup */}
      {billData && (
        <ThermalBill
          isOpen={showThermalBill}
          onClose={() => setShowThermalBill(false)}
          billData={billData}
          showPrintButton={true}
          showDownloadButton={true}
          showShareButton={true}
          onShareToMobile={handleShareToMobile}
        />
      )}

      {/* Sticky Header */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeState(2)}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white">
                Customer Details
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-right">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 px-2.5 py-1.5 rounded-lg">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">
                T-{table?.table_number || '#'}
              </span>
            </div>
            <div className="text-base font-black text-gray-900 dark:text-white tracking-tight">
              ₹{finalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-2xl mx-auto p-4 space-y-4 pb-6">
          <form
            id="customer-details-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Customer Info Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm relative">
              <div className="p-4 space-y-5">
                {/* Name Field */}
                <div className="space-y-2 relative" ref={searchRef}>
                  <Label
                    htmlFor="name"
                    className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <User className="h-3.5 w-3.5" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter customer name"
                    value={customerDetails.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onFocus={() => setShowSearchResults(true)}
                    autoComplete="off"
                    className={`h-11 text-sm rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                      errors.name
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-gray-200 dark:border-gray-700 focus:border-primary'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full" />
                      {errors.name}
                    </p>
                  )}

                  {/* Search Results Dropdown */}
                  {showSearchResults && customerDetails.name.length > 0 && (
                    <CustomerSearchDropdown
                      isSearching={isSearching}
                      searchError={searchError}
                      searchResults={searchResults}
                      onUserSelect={handleUserSelect}
                    />
                  )}
                </div>

                <Separator />

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone_number"
                    className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Mobile Number
                  </Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={customerDetails.phone_number}
                    onChange={(e) =>
                      handleInputChange(
                        'phone_number',
                        e.target.value.replace(/\D/g, '').slice(0, 10),
                      )
                    }
                    className={`h-11 text-sm rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                      errors.phone_number
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-gray-200 dark:border-gray-700 focus:border-primary'
                    }`}
                  />
                  {errors.phone_number && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full" />
                      {errors.phone_number}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {!showSpecialInstructions ? (
              <button
                type="button"
                onClick={() => setShowSpecialInstructions(true)}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary hover:bg-primary/5 border border-dashed border-primary/30 rounded-2xl transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Special Instructions
              </button>
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Special Instructions
                    <span className="text-[10px] text-gray-400 font-normal normal-case tracking-normal">
                      (Optional)
                    </span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowSpecialInstructions(false)}
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <Input
                  id="special_instructions"
                  type="text"
                  placeholder="Any special requests or dietary requirements..."
                  value={specialInstructions || ''}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="h-11 text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-[11px] text-gray-400">
                  Allergies, spice preferences, or special requests
                </p>
              </div>
            )}

            {/* Discount Field */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm p-4 space-y-2">
              <Label
                htmlFor="discount"
                className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5"
              >
                <Tag className="h-3.5 w-3.5" />
                Discount (₹)
              </Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max={subtotal}
                placeholder="0.00"
                value={discount > 0 ? discount : ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  setDiscount(isNaN(val) ? 0 : val)
                }}
                className="h-11 text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Order Summary Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Order Summary
                </h2>
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Table
                  </span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    #{table?.table_number || '#'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Items
                  </span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {orderItems.length} item{orderItems.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                {validatedDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm text-emerald-600">
                    <span>Discount</span>
                    <span className="font-semibold">
                      -₹{validatedDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                {!isTaxLoading && taxAmount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Tax ({taxPercent}%)
                    </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      ₹{taxAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center pt-1">
                  <span className="text-base font-black text-gray-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-xl font-black text-primary tracking-tight">
                    ₹{finalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-gray-400 pt-1">
              Your order will be confirmed once submitted
            </p>
          </form>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto">
          <Button
            type="submit"
            form="customer-details-form"
            disabled={isSubmitting}
            className="w-full rounded-xl h-12 text-base font-bold shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 transition-all hover:shadow-emerald-600/30 hover:translate-y-[-1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Complete Order
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
