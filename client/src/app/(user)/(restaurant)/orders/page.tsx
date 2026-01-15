import UserOrdersPage from '@/components/restaurant/orders/UserOrdersPage'
import React from 'react'

export default function page() {
  // get all orders from the database
  return (
    <div className='w-[50rem] mx-auto h-full p-5 max-[800px]:w-full max-[600px]:p-2'>
      <UserOrdersPage />
    </div>
  )
}
