import React from 'react'
import { useRouterState } from '@tanstack/react-router'
import { AdminHeader } from './AdminHeader'
import { OrdersHeader } from '../orders/order-ui-card/OrdersHeader'
import { SalesHeader } from '../reports/SalesHeader'
import { CRMHeader } from '../crm/CRMHeader'
import { StaffReportHeader } from '../reports/StaffReportHeader'
import { StaffManagementHeader } from '../staff/StaffManagementHeader'
import { InventoryReportHeader } from '../reports/InventoryReportHeader'
import BookTableHeader from '../book-table/BookTableHeader'

export const DynamicHeader: React.FC = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // Define route-to-header mapping
  // We check if it starts with /orders to cover sub-routes if necessary
  if (pathname === '/orders' || pathname.startsWith('/orders/')) {
    return <OrdersHeader />
  }

  // Sales Report Header
  if (pathname === '/reports/sales' || pathname.startsWith('/reports/sales/')) {
    return <SalesHeader />
  }
  // CRM Report Header
  if (pathname === '/reports/crm' || pathname.startsWith('/reports/crm/')) {
    return <CRMHeader />
  }

  // Inventory Report Header
  if (
    pathname === '/reports/inventory' ||
    pathname.startsWith('/reports/inventory/')
  ) {
    return <InventoryReportHeader />
  }

  // Staff Individual Report Header (Specific ID)
  if (pathname.match(/^\/reports\/staff\/[^\/]+$/)) {
    return <StaffReportHeader />
  }

  // Staff Management or Leaderboard Header
  if (
    pathname === '/staff' ||
    pathname.startsWith('/staff/') ||
    pathname === '/reports/staff'
  ) {
    return <StaffManagementHeader />
  }

  // Book Table Header
  if (
    pathname === '/billing/book-table' ||
    pathname.startsWith('/billing/book-table/')
  ) {
    return <BookTableHeader />
  }

  // Default header for all other routes
  return <AdminHeader />
}

export default DynamicHeader
