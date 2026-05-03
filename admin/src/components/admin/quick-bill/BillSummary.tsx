import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Customer } from './QuickBillMain'
import { Plus, Minus, Tag } from 'lucide-react'
import ThermalBill from '@/components/billing/ThermalBill'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import useToast from '@/hooks/UseToast'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useCreateGuestCustomer } from '@/hooks/mutations/useCreateGuestCustomer'
import { useAutoPrint } from '@/hooks/useAutoPrint'

interface BillSummaryProps {
  cart: any[]
  updateQuantity: (itemId: string, delta: number) => void
  selectedCustomer: Customer | null
  onOrderComplete: () => void
  discount: number
  setDiscount: (discount: number) => void
  subtotal: number
  taxAmount: number
  taxPercent: number
  totalAmount: number
}

export default function BillSummary({
  cart,
  updateQuantity,
  selectedCustomer,
  onOrderComplete,
  discount,
  setDiscount,
  subtotal,
  taxAmount,
  taxPercent,
  totalAmount,
}: BillSummaryProps) {
  const { isAuthenticated } = useAdminAuthQuery()
  const { selectedRestaurant } = useRestaurantSelector()
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [completedOrderData, setCompletedOrderData] = useState<any>(null)
  const { showSuccess, showError } = useToast()
  const createGuestCustomer = useCreateGuestCustomer()

  // Auto-print hook
  const { printBill } = useAutoPrint({
    onFallbackToPreview: () => {
      // Show bill preview dialog if auto-print fails or user cancels
      setShowBillDialog(true)
    },
    onPrintSuccess: () => {
      console.log('Print dialog opened successfully')
      // Don't show preview - user is already printing
    },
    onPrintError: (error) => {
      console.error('Print error:', error)
      // Show preview as fallback
      setShowBillDialog(true)
    },
  })

  // Ensure discount doesn't exceed subtotal
  // Note: Parent component handles calculation, this is just for input validation visuals if needed
  const validatedDiscount = Math.min(discount, subtotal)

  const handleDiscountChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setDiscount(Math.max(0, numValue))
  }

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      showError('Error', 'Please login to place an order')
      return
    }
    if (cart.length === 0) {
      showError('Error', 'Cart is empty')
      return
    }
    if (!selectedCustomer) {
      showError('Error', 'Please select a customer')
      return
    }

    // Try to get RID from categories (assuming items loaded or use selectedRestaurant)
    // Fallback to selectedRestaurant?.id if item rid not present
    const rid = cart[0]?.rid || selectedRestaurant?.id
    if (!rid) {
      showError('Error', 'System Error: Restaurant ID not found')
      return
    }

    setIsPlacingOrder(true)

    // Helper function to place the order with customer details
    const placeOrderWithCustomer = async (customerDetails: any) => {
      const { default: axios } = await import('axios')
      
      // Unified payload for /api/quick-bill
      // Distribute discount proportionally across items
      const discountPerItem = validatedDiscount / cart.length

      const payload = {
        customerDetails,
        orderItems: cart.map((item) => ({
          ...item,
          id: item.id.toString().includes('_')
            ? item.id.toString().split('_')[0]
            : item.id,
          rid: rid,
          order_status: 'completed',
          variantId: item.variantId ? parseInt(item.variantId) : 0,
          discount_amount: discountPerItem,
          totalItemAmount: item.price * item.quantity,
        })),
      }

      const res = await axios.post('/api/quick-bill', payload)

      if (res.data && (res.data.success || res.data.status === 201)) {
        showSuccess('Success', 'Order placed successfully')

        // Prepare bill data for printing using the calculated values
        const billData = {
          orderId: res.data.order_id || 'New',
          restaurantName: selectedRestaurant?.name || 'Restaurant',
          tableNo: 'N/A',
          customerName: customerDetails.name,
          customerPhone: customerDetails.phone_number,
          items: cart.map((i: any) => ({
            name: i.cartItemName || i.name,
            quantity: i.quantity,
            price: (i.price || i.cost_price) * i.quantity,
            addons: i.addons,
          })),
          discountAmount: validatedDiscount,
          totalAmount: subtotal,
          grandTotal: totalAmount,
          subtotal: subtotal,
          taxPercent: taxPercent,
          taxAmount: taxAmount,

          orderDate: new Date().toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          paymentMethod: 'Cash',
          paymentStatus: 'Paid',
        }

        setCompletedOrderData(billData)
        onOrderComplete()
        
        // Auto-print with fallback to preview
        await printBill(
          billData,
          {
            subtotal,
            taxAmount,
            taxPercent,
            totalAmount,
          },
          selectedRestaurant?.name || 'Restaurant',
          selectedRestaurant?.id // Pass restaurant ID for preferences
        )
      } else {
        showError(
          'Error',
          res.data.message || res.data.error || 'Failed to place order',
        )
      }
    }

    try {
      // If this is a guest customer, create it first using TanStack Query mutation
      if (selectedCustomer.isGuest) {
        createGuestCustomer.mutate(undefined, {
          onSuccess: async (guestData) => {
            try {
              // Update customer details with the created guest customer
              const customerDetails = {
                username: guestData.data.username,
                name: guestData.data.name,
                phone_number: guestData.data.phone_number,
                id: guestData.data.uid,
              }
              await placeOrderWithCustomer(customerDetails)
            } catch (error: any) {
              console.error('Order error after guest creation:', error)
              showError(
                'Error',
                error.response?.data?.message || 'Error placing order',
              )
            } finally {
              setIsPlacingOrder(false)
            }
          },
          onError: (error: any) => {
            console.error('Guest customer creation error:', error)
            showError(
              'Error',
              error.response?.data?.message ||
                'Failed to create guest customer',
            )
            setIsPlacingOrder(false)
          },
        })
      } else {
        // Regular customer - place order directly
        const customerDetails = {
          username: selectedCustomer.username,
          name: selectedCustomer.name,
          phone_number: selectedCustomer.phone_number,
          id: selectedCustomer.id || undefined,
        }
        
        await placeOrderWithCustomer(customerDetails)
        setIsPlacingOrder(false)
      }
    } catch (error: any) {
      console.error('Order error', error)
      showError('Error', error.response?.data?.message || 'Error placing order')
      setIsPlacingOrder(false)
    }
  }

  return (
    <div className="flex flex-col sidebar:h-full bg-slate-50 rounded-md">
      {completedOrderData && showBillDialog && (
        <ThermalBill
          isOpen={showBillDialog}
          onClose={() => {
            setShowBillDialog(false)
            setCompletedOrderData(null)
          }}
          billData={completedOrderData}
        />
      )}

      <div className="p-3 sidebar:flex-1 sidebar:overflow-auto">
        {cart.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">Cart is empty</div>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start bg-white p-2 rounded shadow-sm"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    ₹{item.price} x {item.quantity}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    disabled={item.stock ? item.quantity >= item.stock : false}
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-t space-y-3">
        {/* Discount Input */}
        <div className="space-y-2">
          <Label
            htmlFor="discount"
            className="text-sm font-medium flex items-center gap-1"
          >
            <Tag className="w-3 h-3" />
            Discount (₹)
          </Label>
          <Input
            id="discount"
            type="number"
            min="0"
            max={subtotal}
            step="0.01"
            value={discount || ''}
            onChange={(e) => handleDiscountChange(e.target.value)}
            placeholder="0.00"
            className="h-9"
            disabled={cart.length === 0}
          />
          {validatedDiscount < discount && discount > 0 && (
            <p className="text-xs text-amber-600">
              Discount capped at subtotal (₹{subtotal.toFixed(2)})
            </p>
          )}
        </div>

        {/* Bill Summary */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {validatedDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{validatedDiscount.toFixed(2)}</span>
            </div>
          )}

          {/* Tax Row */}
          <div className="flex justify-between text-gray-600">
            <span>Tax ({taxPercent}%)</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t text-base font-bold">
            <span>Total</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <Button
          className="w-full h-10"
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder || cart.length === 0 || !selectedCustomer}
        >
          {isPlacingOrder ? 'Placing Order...' : 'Place Order & Print'}
        </Button>
      </div>
    </div>
  )
}
