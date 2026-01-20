import * as React from 'react'
import {
  ChartCandlestick,
  ChartNoAxesCombined,
  History,
  Home,
  ListOrdered,
  MessageSquareWarning,
  User,
  UtensilsCrossed,
  Receipt,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/useAuth'
import { AdminNavMain } from './AdminNavMain'
import { AdminSidebarProfile } from './AdminSidebarProfile'
// tokenService no longer needed - using httpOnly cookies

// this is for hydration issue client side only component
function ClientOnlySidebar({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return <>{children}</>
}

// This is sample data.

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  // Sidebar always shown - auth is handled at route level

  const data = {
    user: {
      name: user?.name || user?.username || user?.phone_number || 'Guest',
      email: user?.email || 'guest@example.com',
      avatar: user?.profile_pic || './delycia-logo.jpg',
    },
    navMain: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: ChartNoAxesCombined,
      },
      {
        title: 'Quick Bill',
        url: '/quick-bill',
        icon: Receipt,
      },
      {
        title: 'Book Table',
        url: '/book-table',
        icon: UtensilsCrossed,
      },

      {
        title: 'Orders',
        url: '/orders',
        icon: ListOrdered,
      },
      {
        title: 'Order History',
        url: '/order-history',
        icon: History,
      },
      {
        title: 'Menu',
        url: '/menu',
        icon: MessageSquareWarning,
      },
      {
        title: 'Affiliate Center',
        url: '/affiliate',
        icon: ChartCandlestick,
      },
      // {
      //   title: "Offers",
      //   url: "/offers",
      //   icon: Discount,
      // },
      // {
      //   title: "Payouts",
      //   url: "/payouts",
      //   icon: PaymentOutlined,
      // },
      // {
      //   title: "Customer Feedback",
      //   url: "/feedback",
      //   icon: Feedback,
      // },
      // {
      //   title: "Users",
      //   url: "/users",
      //   icon: User,
      // },
      // {
      //   title: "Help Center",
      //   url: "/help-center",
      //   icon: Help,
      // },
      {
        title: 'CRM',
        url: '/crm',
        icon: User,
      },
    ],
  }

  return (
    <ClientOnlySidebar>
      <Sidebar collapsible="icon" {...props}>
        {/* <SidebarHeader>Hello</SidebarHeader> */}
        <SidebarContent>
          <AdminNavMain items={data.navMain} />
          {/* <NavProjects projects={data.projects} /> */}
        </SidebarContent>
        <SidebarFooter>
          <AdminSidebarProfile user={data.user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </ClientOnlySidebar>
  )
}
