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
import { useRouterState } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { RestaurantDropdown } from '@/components/admin/header/RestaurantDropdown'
import { NetworkStatusIcon } from '@/components/common/NetworkStatusIcon'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import {
  useFeatureFlagsQuery,
  getHiddenNavItems,
} from '@/hooks/queries/useFeatureFlagsQuery'

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
    isActive: false,
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
    isActive: false,
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
    url: '/support',
    icon: LifeBuoy,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAdminAuthQuery()
  const { isMobile, setOpenMobile } = useSidebar()
  const { pathname } = useRouterState({ select: (s) => s.location })
  const { selectedRid } = useRestaurantSelector()
  const { data: featureFlags } = useFeatureFlagsQuery(selectedRid)

  // Get set of nav item titles that should be hidden
  const hiddenItems = React.useMemo(
    () => getHiddenNavItems(featureFlags),
    [featureFlags],
  )

  // Compute dynamic navigation items with feature filtering
  const dynamicNavMain = React.useMemo(() => {
    return (
      navMain
        .filter((item) => !hiddenItems.has(item.title))
        .map((item) => {
          // Filter sub-items too
          const filteredSubItems = item.items?.filter(
            (sub) => !hiddenItems.has(sub.title),
          )

          // Check if any sub-item is active
          const isSubItemActive = filteredSubItems?.some(
            (sub) => pathname === sub.url || pathname.startsWith(sub.url + '/'),
          )
          // Check if the parent item itself is active
          const isParentActive =
            pathname === item.url || pathname.startsWith(item.url + '/')

          return {
            ...item,
            items: filteredSubItems,
            isActive: isSubItemActive || isParentActive,
          }
        })
        // Remove parent if all sub-items were filtered out (and it has no direct page)
        .filter((item) => {
          if (item.items && item.items.length === 0) {
            // Keep parent only if it has its own direct URL that's not just a container
            // e.g. /reports has sub-items, so if all are hidden, hide the parent
            return false
          }
          return true
        })
    )
  }, [pathname, hiddenItems])

  // Automatically close sidebar on mobile when pathname changes
  React.useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile])

  // Format user data for NavUser
  const userData = {
    name: user?.name || user?.username || 'Guest',
    email: user?.email,
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
        <NavMain items={dynamicNavMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex justify-end px-2">
          <NetworkStatusIcon />
        </div>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
