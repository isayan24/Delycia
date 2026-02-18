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
} from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { useCartStore, selectCartTotalItems } from '@/store/useCartStore'

const dockItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-sky-500',
  },
  {
    title: 'Quick Bill',
    url: '/billing/quick-bill',
    icon: ReceiptIndianRupee,
    color: 'text-indigo-500',
  },
  {
    title: 'Orders',
    url: '/orders',
    icon: ShoppingBag,
    color: 'text-amber-500',
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
  },
]

export function MobileDock() {
  const isMobile = useIsMobile()
  const isSmallScreen = useMediaQuery('(max-width: 500px)')
  const path = useRouterState({ select: (s) => s.location.pathname })
  const cartCount = useCartStore(selectCartTotalItems)
  const isHidden = useScrollHide()

  // Only show the dock on mobile/tablet (below 900px)
  if (!isMobile) return null

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
            : 'bottom-6 left-1/2 w-[92%] max-w-[450px]',
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between gap-1 overflow-hidden transition-all duration-300',
            isSmallScreen
              ? 'bg-white dark:bg-[#1d130c] border-t border-[#ead9cd] dark:border-primary/10 rounded-t-2xl p-1.5 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'
              : 'bg-white/70 dark:bg-[#1d130c]/80 backdrop-blur-2xl border border-[#ead9cd] dark:border-primary/10 rounded-4xl p-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
          )}
        >
          {dockItems.map((item) => {
            const isActive = path.startsWith(item.url)
            const Icon = item.icon

            const isQuickBill = item.url === '/billing/quick-bill'

            return (
              <Link
                key={item.url}
                to={item.url}
                className="relative flex-1 group"
              >
                <div
                  className={cn(
                    'flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all duration-300 gap-1',
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
                        'w-5 h-5 transition-colors',
                        isActive
                          ? item.color
                          : 'text-[#a16b45] opacity-60 group-hover:opacity-100',
                      )}
                    />

                    {/* Cart Badge - Option 2 */}
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
                    // ... rest of link content ...
                    className={cn(
                      'text-[10px] font-bold tracking-tight transition-colors truncate w-full text-center px-1',
                      isActive
                        ? 'text-slate-900 dark:text-white'
                        : 'text-[#a16b45] opacity-40 group-hover:opacity-80',
                    )}
                  >
                    {item.title}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="dock-indicator"
                      className="absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full"
                      transition={{
                        type: 'spring',
                        damping: 12,
                        stiffness: 120,
                      }}
                    />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
