import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CartItem, Customer } from './QuickBillMain'
import { Plus, Minus, Tag } from 'lucide-react'
import ThermalBill from '@/components/admin/order-history/ThermalBill'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import useToast from '@/hooks/UseToast'

interface BillSummaryProps {
  cart: CartItem[]
  updateQuantity: (itemId: string, delta: number) => void
  selectedCustomer: Customer | null
  onOrderComplete: () => void
  discount: number
  setDiscount: (discount: number) => void
}

export default function BillSummary({
  cart,
  updateQuantity,
  selectedCustomer,
  onOrderComplete,
  discount,
  setDiscount,
}: BillSummaryProps) {
  const { isAuthenticated } = useAdminAuthQuery()
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [showBillDialog, setShowBillDialog] = useState(false)
  const [completedOrderData, setCompletedOrderData] = useState<any>(null)
  const { showSuccess, showError } = useToast()

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price ?? item.cost_price) * item.quantity,
    0,
  )

  // Ensure discount doesn't exceed subtotal and is non-negative
  const validatedDiscount = Math.max(0, Math.min(discount, subtotal))
  const totalAmount = subtotal - validatedDiscount

  const handleDiscountChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setDiscount(Math.max(0, numValue)) // Allow any positive value, validation happens in calculation
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

    // Try to get RID from categories (assuming they are loaded and belong to the same restaurant)
    const rid = cart[0]?.rid
    if (!rid) {
      showError('Error', 'System Error: Restaurant ID not found')
      return
    }

    setIsPlacingOrder(true)
    try {
      // Unified payload for /api/quick-bill
      // Distribute discount proportionally across items
      const discountPerItem = validatedDiscount / cart.length

      const payload = {
        customerDetails: {
          username: selectedCustomer.username,
          name: selectedCustomer.name,
          phone_number: selectedCustomer.phone_number,
          id: selectedCustomer.id || undefined, // Pass ID if it exists (existing user)
        },
        orderItems: cart.map((item) => ({
          ...item,
          rid: rid,
          order_status: 'completed',
          variantId: item.variantId || null,
          discount_amount: discountPerItem,
          totalItemAmount: item.price * item.quantity,
        })),
      }
      // Use axios directly for internal Next.js API route to avoid base URL issues
      // Importing locally if not available or assuming axios is available
      const { default: axios } = await import('axios')
      const res = await axios.post('/api/quick-bill', payload)

      if (res.data && (res.data.success || res.data.status === 201)) {
        showSuccess('Success', 'Order placed successfully')

        // Prepare bill data for printing
        const billData = {
          orderId: res.data.order_id || 'New',
          tableNo: 'N/A',
          customerName: selectedCustomer.name,
          customerId: selectedCustomer.phone_number,
          items: cart.map((i: any) => ({
            name: i.cartItemName || i.name,
            quantity: i.quantity,
            price: (i.price || i.cost_price) * i.quantity, // Show total line price
            addons: i.addons,
          })),
          discountAmount: validatedDiscount,
          totalAmount: subtotal,
          orderDate: new Date().toLocaleString(),
          paymentMethod: 'Cash',
          paymentStatus: 'Paid',
        }

        setCompletedOrderData(billData)
        onOrderComplete()
        setShowBillDialog(true)
      } else {
        showError(
          'Error',
          res.data.message || res.data.error || 'Failed to place order',
        )
      }
    } catch (error: any) {
      console.error('Order error', error)
      showError('Error', error.response?.data?.message || 'Error placing order')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-md">
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

      <ScrollArea className="flex-1 p-3 overflow-auto">
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
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

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
