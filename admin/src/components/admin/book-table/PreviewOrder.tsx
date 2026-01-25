import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Receipt,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  Edit3,
  Trash2,
  Plus,
  Minus,
} from 'lucide-react'
import { useTableStore } from '@/store/useTableStore'

interface OrderItem {
  item: {
    id: string
    name: string
    price: number
    description?: string
    image?: string
    category_id: string
  }
  quantity: number
  totalPrice: number
}

export default function PreviewOrder() {
  const {
    table,
    orderItems,
    clearAllItems,
    changeState,
    updateQuantity,
    getTotalAmount,
  } = useTableStore()

  const onCancelOrder = () => {
    changeState(0)
    clearAllItems()
  }
  const onEditOrder = () => {
    changeState(1)
  }
  const onConfirmOrder = () => {
    changeState(3)
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 relative">
      {/* Fixed Top Action Buttons */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white dark:bg-gray-900  p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 ">
            <Receipt className="w-4 h-4 text-primary text-[1rem] md:h-6 md:w-6" />
            <h1 className="text-[1rem] md:text-lg text-gray-900 dark:text-white">
              Order Preview
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancelOrder}>
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button variant="outline" size="sm" onClick={onEditOrder}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with padding for fixed elements */}
      <div className="pt-20 pb-24 p-4 h-full overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-3 overflow-auto h-full">
          {/* Table Information */}
          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Table {table?.table_number || '#'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Ground Floor
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {/* <span>{totalItems} items</span> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-md font-medium">
                <Receipt className="h-5 w-5" />
                Order Items ({orderItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {orderItems.map((orderItem, index) => (
                  <div key={orderItem.id}>
                    <div className="p-4 flex items-center gap-4">
                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className=" text-lg max-[768px]:text-md">
                          {orderItem.quantity} x {orderItem.name}
                        </h4>

                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            ₹{orderItem.price} each
                          </Badge>
                        </div>
                      </div>
                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-lg  max-[768px]:text-md">
                          ₹{orderItem.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {index < orderItems.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    ₹{getTotalAmount().toFixed(2)}
                  </span>
                </div>
                {/* Todo: add gst/tax as needed */}
                {/* <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="font-medium">₹{(getTotalAmount() * 0.08).toFixed(2)}</span>
                </div> */}
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span>₹{getTotalAmount().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary Stats */}
        </div>
      </div>

      {/* Fixed Bottom Confirm Button */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-t p-2">
        <div className="max-w-4xl mx-auto">
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
            onClick={onConfirmOrder}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Confirm Order ₹{getTotalAmount().toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  )
}
