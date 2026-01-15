import { CheckCircle } from 'lucide-react'
import React from 'react'

export default function page() {
    // TODO: CLear the cart if order placed
    
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <CheckCircle className="h-24 w-24 text-green-500" />
      <h1 className="text-2xl font-bold mt-4">Your order has been placed!</h1>
      <a href="/orders" className="text-blue-500 mt-2">Go to your orders</a>
    </div>
  )
}
