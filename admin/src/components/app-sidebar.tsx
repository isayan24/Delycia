'use client'

import * as React from 'react'
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Utensils,
  BarChart3,
  CalendarCheck,
  Users,
  UserCircle,
  LifeBuoy,
  Send,
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
    title: 'Quick Bill',
    url: '/quick-bill',
    icon: ShoppingCart,
    color: 'text-indigo-500',
  },
  {
    title: 'Orders',
    url: '#',
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
        url: '/order-history',
      },
    ],
  },
  {
    title: 'Menu',
    url: '/menu',
    icon: Utensils,
    color: 'text-rose-500',
  },
  {
    title: 'Reports',
    url: '#',
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
    ],
  },
  {
    title: 'Book Table',
    url: '/book-table',
    icon: CalendarCheck,
    color: 'text-pink-500',
  },
  {
    title: 'Affiliate Center',
    url: '/affiliate',
    icon: Users,
    color: 'text-purple-500',
  },
  {
    title: 'CRM',
    url: '/crm',
    icon: UserCircle,
    color: 'text-teal-500',
  },
]

const navSecondary = [
  {
    title: 'Support',
    url: '#',
    icon: LifeBuoy,
  },
  {
    title: 'Feedback',
    url: '#',
    icon: Send,
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
