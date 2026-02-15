import React from 'react'
import { useRouterState } from '@tanstack/react-router'
import { AdminHeader } from './AdminHeader'
import { OrdersHeader } from '../orders/order-ui-card/OrdersHeader'

export const DynamicHeader: React.FC = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // Define route-to-header mapping
  // We check if it starts with /orders to cover sub-routes if necessary
  if (pathname === '/orders' || pathname.startsWith('/orders/')) {
    return <OrdersHeader />
  }

  // Default header for all other routes
  return <AdminHeader />
}

export default DynamicHeader
