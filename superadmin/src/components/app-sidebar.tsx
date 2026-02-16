'use client'

import * as React from 'react'
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Users,
  Utensils,
  UserCog,
  Settings,
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
import { useAuth } from '@/hooks/useAuth'

// Superadmin Navigation Data
const navMain = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-sky-500',
  },
  {
    title: 'Restaurants',
    url: '/restaurants',
    icon: Store,
    color: 'text-indigo-500',
  },
  {
    title: 'Subscriptions',
    url: '/subscriptions',
    icon: CreditCard,
    color: 'text-amber-500',
    isActive: true,
    items: [
      {
        title: 'Plans',
        url: '/subscriptions/plans',
      },
      {
        title: 'Assignments',
        url: '/subscriptions/assignments',
      },
    ],
  },
  {
    title: 'Users',
    url: '/users',
    icon: Users,
    color: 'text-rose-500',
  },
  {
    title: 'Menus',
    url: '/menus',
    icon: Utensils,
    color: 'text-emerald-500',
  },
  {
    title: 'Staff',
    url: '/staff',
    icon: UserCog,
    color: 'text-purple-500',
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    color: 'text-slate-500',
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
  const { user, logout } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()
  const { pathname } = useRouterState({ select: (s) => s.location })

  // Automatically close sidebar on mobile when pathname changes
  React.useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile])

  // Format user data for NavUser
  const userData = {
    name: user?.name || user?.username || 'Superadmin',
    email: user?.email,
    avatar: user?.profile_pic || '/logo.png', // Fallback to logo or default
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="h-4 w-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Superadmin</span>
                <span className="truncate text-xs text-muted-foreground">
                  Platform Management
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} onLogout={logout} />
      </SidebarFooter>
    </Sidebar>
  )
}
