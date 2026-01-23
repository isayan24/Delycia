'use client'

import * as React from 'react'
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Utensils,
  BarChart3,
  Users,
  LifeBuoy,
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/useAuth'
import { RestaurantDropdown } from '@/components/admin/header/RestaurantDropdown'

// Delycia Navigation Data
const navMain = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-sky-500',
  },
  {
    title: 'Billing',
    url: '/billing',
    icon: ShoppingCart,
    color: 'text-indigo-500',
    isActive: true,
    items: [
      {
        title: 'Quick Bill',
        url: '/billing/quick-bill',
      },
      {
        title: 'Book Table',
        url: '/billing/book-table',
      },
    ],
  },
  {
    title: 'Orders Overview',
    url: '/orders/overview',
    icon: ShoppingBag,
    color: 'text-amber-500',
    isActive: true,
    items: [
      {
        title: 'Orders',
        url: '/orders',
      },
      {
        title: 'Order History',
        url: '/orders/history',
      },
    ],
  },
  {
    title: 'Inventory',
    url: '/inventory',
    icon: Utensils,
    color: 'text-rose-500',
    isActive: true,
    items: [
      {
        title: 'Manage Menu',
        url: '/inventory/menu',
      },
      {
        title: 'Manage Inventory',
        url: '/inventory/stock',
      },
    ],
  },
  {
    title: 'Reports',
    url: '/reports',
    icon: BarChart3,
    isActive: true,
    color: 'text-emerald-500',
    items: [
      {
        title: 'Sales Report',
        url: '/reports/sales',
      },
      {
        title: 'Inventory Report',
        url: '/reports/inventory',
      },
      {
        title: 'Customer Management',
        url: '/reports/crm',
      },
      {
        title: 'Staff Reports',
        url: '/reports/staff',
      },
    ],
  },
  {
    title: 'Staff Management',
    url: '/staff',
    icon: Users,
    color: 'text-purple-500',
  },
]

const navSecondary = [
  {
    title: 'Support',
    url: '#',
    icon: LifeBuoy,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  // Format user data for NavUser
  const userData = {
    name: user?.name || user?.username || user?.phone_number || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: user?.profile_pic || '/delycia-logo.jpg', // Fallback to logo or default
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Restaurant Dropdown integrated into Sidebar Header */}
            <div className="w-full py-2">
              <RestaurantDropdown />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
