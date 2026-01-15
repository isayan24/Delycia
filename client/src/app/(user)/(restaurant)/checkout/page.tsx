import Checkout from '@/components/restaurant/checkout/Checkout' 
import React from 'react'

export default function page() {
  
  return (
    <div className='p-5 mx-auto w-fit max-[1000px]:w-full max-[700px]:p-2'>
        {/* <CheckoutFalse/> */}
        <Checkout/>
    </div>
  )
}
