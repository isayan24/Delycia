'use client'

import React from 'react'
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from 'motion/react'
import { useScrollHide } from '@/hooks/use-scroll-hide'
import {
  LayoutDashboard,
  ReceiptIndianRupee,
  ShoppingBag,
  Utensils,
  Users,
  BarChart3,
  History,
  Calendar,
} from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { useCartStore, selectCartTotalItems } from '@/store/useCartStore'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import {
  useFeatureFlagsQuery,
  getHiddenNavItems,
} from '@/hooks/queries/useFeatureFlagsQuery'

const dockItems = [
  {
    title: 'Home',
    url: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-sky-500',
  },
  {
    title: 'Bill',
    url: '/billing/quick-bill',
    icon: ReceiptIndianRupee,
    color: 'text-indigo-500',
  },
  {
    title: 'Book',
    url: '/billing/book-table',
    icon: Calendar,
    color: 'text-emerald-500',
    tabletOnly: true,
    /** Hidden when table_management feature is off */
    hiddenNavTitle: 'Book Table',
  },
  {
    title: 'Live',
    url: '/orders',
    icon: ShoppingBag,
    color: 'text-amber-500',
  },
  {
    title: 'History',
    url: '/orders/history',
    icon: History,
    color: 'text-orange-500',
    tabletOnly: true,
  },
  {
    title: 'Menu',
    url: '/inventory/menu',
    icon: Utensils,
    color: 'text-rose-500',
  },
  {
    title: 'Staff',
    url: '/staff',
    icon: Users,
    color: 'text-purple-500',
    /** Hidden when staff_management feature is off */
    hiddenNavTitle: 'Staff Management',
  },
  {
    title: 'Sales',
    url: '/reports/sales',
    icon: BarChart3,
    color: 'text-cyan-500',
    tabletOnly: true,
    /** Hidden when reports feature is off */
    hiddenNavTitle: 'Reports',
  },
]

export function MobileDock() {
  const isMobile = useIsMobile()
  const isSmallScreen = useMediaQuery('(max-width: 540px)')
  const path = useRouterState({ select: (s) => s.location.pathname })
  const cartCount = useCartStore(selectCartTotalItems)
  const isHidden = useScrollHide()
  const { selectedRid } = useRestaurantSelector()
  const { data: featureFlags } = useFeatureFlagsQuery(selectedRid)

  // Get hidden nav items from feature flags
  const hiddenItems = React.useMemo(
    () => getHiddenNavItems(featureFlags),
    [featureFlags],
  )

  // Only show the dock on mobile/tablet (below 900px)
  if (!isMobile) return null

  // Filter items: by screen size AND by feature flags
  const visibleItems = dockItems
    .filter((item) => !isSmallScreen || !item.tabletOnly)
    .filter(
      (item) => !item.hiddenNavTitle || !hiddenItems.has(item.hiddenNavTitle),
    )

  // Improved Active Link Logic: Find the most specific match (longest URL)
  const activeItem = visibleItems
    .filter((item) => path === item.url || path.startsWith(item.url + '/'))
    .reduce(
      (prev, curr) => (curr.url.length > (prev?.url.length || 0) ? curr : prev),
      null as any,
    )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{
          y: isHidden ? 120 : 0,
          opacity: 1,
          x: isSmallScreen ? 0 : '-50%',
        }}
        exit={{ y: 100, opacity: 0 }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 250,
          mass: 0.5,
          opacity: { duration: 0.15 },
        }}
        className={cn(
          'fixed z-50 transition-all duration-300',
          isSmallScreen
            ? 'bottom-0 left-0 right-0 w-full max-w-none'
            : 'bottom-6 left-1/2 w-[95%] max-w-[700px]',
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between gap-1 overflow-visible transition-all duration-300',
            isSmallScreen
              ? 'bg-white dark:bg-[#1d130c] border-t border-[#ead9cd] dark:border-primary/10 rounded-t-2xl p-1.5 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'
              : 'bg-white dark:bg-[#1d130c]/90 backdrop-blur-2xl border border-[#ead9cd] dark:border-primary/10 rounded-4xl p-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
          )}
        >
          {visibleItems.map((item) => {
            const isActive = activeItem?.url === item.url
            const Icon = item.icon

            const isQuickBill = item.url === '/billing/quick-bill'

            return (
              <Link
                key={item.url}
                to={item.url}
                className="relative flex-1 group min-w-0"
              >
                <div
                  className={cn(
                    'flex flex-col items-center justify-center py-2 md:py-3 rounded-2xl transition-all duration-300 gap-1',
                    isActive
                      ? 'bg-slate-100 dark:bg-primary/10'
                      : 'hover:bg-slate-50 dark:hover:bg-primary/5',
                  )}
                >
                  <motion.div
                    className="relative"
                    animate={
                      isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }
                    }
                    transition={{ type: 'spring', damping: 15 }}
                  >
                    <Icon
                      className={cn(
                        'size-5 md:size-5.5 transition-colors',
                        isActive
                          ? item.color
                          : 'text-[#a16b45] opacity-60 group-hover:opacity-100',
                      )}
                    />

                    {/* Cart Badge */}
                    {isQuickBill && cartCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-orange-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-[#1d130c] flex items-center justify-center px-1"
                      >
                        {cartCount}
                      </motion.div>
                    )}
                  </motion.div>

                  <span
                    className={cn(
                      'text-[9px] md:text-[10px] font-bold tracking-tight transition-colors truncate w-full text-center px-1',
                      isActive
                        ? 'text-slate-900 dark:text-white'
                        : 'text-[#a16b45] opacity-40 group-hover:opacity-80',
                    )}
                  >
                    {item.title}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
