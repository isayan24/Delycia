import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  User,
  Phone,
  ArrowLeft,
  Check,
  MessageSquare,
  Plus,
  Tag,
} from 'lucide-react'
import { useTableStore } from '@/store/useTableStore'
import axios from 'axios'
import useToast from '@/hooks/UseToast'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useFetchTable } from './hooks/useFetchTable'
import { useCustomerSearch, UserSearchResult } from './hooks/useCustomerSearch'
import { CustomerSearchDropdown } from './CustomerSearchDropdown'
import { generateUsername } from '@/helpers/user/generateUsername'

interface CustomerDetails {
  name: string
  phone_number: string
  username: string
  // special_instructions?: string;
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

  const {
    changeState,
    table,
    orderItems,
    getTotalAmount,
    clearAllItems,
    refetchTables,
  } = useTableStore()

  const { showError, showSuccess } = useToast()

  // Use custom search hook
  const { searchResults, isSearching, searchError, clearResults } =
    useCustomerSearch(customerDetails.name)

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

  // Handle user selection from search results
  const handleUserSelect = (user: UserSearchResult) => {
    setCustomerDetails({
      name: user.name,
      phone_number: user.phone_number,
      username: user.username,
    })
    setShowSearchResults(false)
    clearResults()
    // Clear any existing errors
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

      // Auto-generate username when name changes
      if (field === 'name') {
        updated.username = generateUsername(value)
      }

      return updated
    })

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const [discount, setDiscount] = useState<number>(0)

  // ... (previous helper functions)

  const subtotal = getTotalAmount()
  const validatedDiscount = Math.max(0, Math.min(discount, subtotal))
  const finalAmount = subtotal - validatedDiscount

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
          discount_amount: discountPerItem,
        })),
        totalAmount: finalAmount,
        table,
      }
      await axios.post('/api/waiter-orders', orderData)
      showSuccess('Success', 'Order placed successfully')
      setCustomerDetails({ name: '', phone_number: '', username: '' })
      setDiscount(0)
      clearAllItems()
      changeState(0)

      // Refetch tables data after successful order
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
    <div className="h-full flex flex-col relative overflow-hidden">
      <div className="flex-1 overflow-auto p-4 pb-32">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => changeState(2)}
              className="flex items-center gap-2 hover:bg-orange-100 border-orange-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Preview
            </Button>
            <div className="text-right">
              <p className="text-sm text-orange-600 font-medium">
                Table {table?.table_number || '#'}
              </p>
              <p className="text-lg font-bold text-orange-800">
                ₹{finalAmount}
              </p>
            </div>
          </div>

          {/* Main Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 px-6 pb-4 border-b border-gray-100">
              <User className="h-4 w-4 text-orange-500" />
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Customer Details
              </h2>
            </div>
            <CardContent className="space-y-6">
              <form
                id="customer-details-form"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Name Field with Autocomplete */}
                <div className="space-y-2 relative" ref={searchRef}>
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-orange-500" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={customerDetails.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onFocus={() => setShowSearchResults(true)}
                    autoComplete="off"
                    className={`h-12 !text-[1.1rem] border-1 transition-all duration-200 focus:ring-1 focus:ring-orange-200 ${
                      errors.name
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-orange-200 focus:border-orange-400'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
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

                {/* Mobile Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone_number"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4 text-orange-500" />
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
                    className={`h-12 !text-[1rem] border-1 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${
                      errors.phone_number
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-orange-200 focus:border-orange-400'
                    }`}
                  />
                  {errors.phone_number && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.phone_number}
                    </p>
                  )}
                </div>

                {/* Special Instructions Toggle Button */}
                {!showSpecialInstructions && (
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSpecialInstructions(true)}
                      className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                      Add Special Instructions
                    </Button>
                  </div>
                )}

                {/* Special Instructions Field */}
                {showSpecialInstructions && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="special_instructions"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4 text-orange-500" />
                      Special Instructions
                      <span className="text-xs text-gray-500 font-normal">
                        (Optional)
                      </span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="special_instructions"
                        type="text"
                        placeholder="Any special requests or dietary requirements..."
                        value={specialInstructions || ''}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        className="h-12 text-base border-1 border-orange-200 focus:border-orange-400 transition-all duration-200 focus:ring-1 focus:ring-orange-200 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowSpecialInstructions(false)
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      >
                        ×
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Let us know about any allergies, spice preferences, or
                      special requests
                    </p>
                  </div>
                )}

                {/* Discount Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="discount"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Tag className="h-4 w-4 text-orange-500" />
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
                    className="h-12 !text-[1rem] border-1 border-orange-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
                  />
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Order Summary
                  </h3>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                    <span>Table Number:</span>
                    <span className="font-medium">
                      #{table?.table_number || '#'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                    <span>Items:</span>
                    <span className="font-medium">
                      {orderItems.length} item{orderItems.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                    <span>Subtotal:</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                  {validatedDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600 mb-1">
                      <span>Discount:</span>
                      <span className="font-medium">
                        -₹{validatedDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold text-orange-800 pt-2 border-t border-orange-200">
                    <span>Total Amount:</span>
                    <span>₹{finalAmount}</span>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-gray-500">
            <p>Your order will be confirmed once submitted</p>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-2 border-t bg-white z-10">
        <div className="max-w-2xl mx-auto">
          {/* Submit Button */}
          <Button
            type="submit"
            form="customer-details-form"
            disabled={isSubmitting}
            className="w-full h-10 text-base font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing Order...
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
