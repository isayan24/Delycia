import React from 'react'
import {
  IndianRupee,
  Box,
  AlertTriangle,
  FileText,
  BarChart3,
  Users,
  ArrowRight,
  Utensils,
  ClipboardList,
} from 'lucide-react'
import {
  useDashboardStatsQuery,
  useInventoryLevelsQuery,
} from '@/hooks/queries/useDashboardQueries'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import DateFilterComponent from '@/components/admin/dashboard/DateFilterComponent'
import { Skeleton } from '@/components/ui/skeleton'
import { useDateFilterStore } from '@/store/useDateFilterStore'

interface OverviewPageProps {
  rid: string
}

const OverviewPage: React.FC<OverviewPageProps> = ({ rid }) => {
  const { currentDateRange } = useDateFilterStore()
  const navigate = useNavigate()

  const queryParams = {
    rid,
    startDate: currentDateRange.startDate,
    endDate: currentDateRange.endDate,
  }

  const { data: stats } = useDashboardStatsQuery(queryParams)
  const { data: inventoryData } = useInventoryLevelsQuery(queryParams)

  const inventorySummary = inventoryData?.summary || {
    critical: 0,
    low: 0,
    medium: 0,
    good: 0,
    total: 0,
  }

  const sections = {
    topCards: [
      {
        id: 'sales',
        title: '₹' + (stats?.totalSales.toLocaleString() || '0'),
        subtitle: 'Sales', // Shortened from "Sales This Month" as it changes with filter
        value: '',
        icon: IndianRupee,
        color: 'text-green-600',
        borderColor: 'border-green-200',
        bgColor: 'bg-white',
        actionText: 'View Full details',
        actionLink: '/reports/sales',
        accentColor: 'bg-green-100 text-green-700',
        iconColor: 'text-green-600',
      },
      {
        id: 'inventory-total',
        title: inventorySummary.total.toString(),
        subtitle: 'Total Items',
        value: '',
        icon: Box,
        color: 'text-blue-600',
        borderColor: 'border-blue-200',
        bgColor: 'bg-white',
        actionText: 'Visit Inventory',
        actionLink: '/reports/inventory?filter=all',
        accentColor: 'bg-blue-100 text-blue-700',
        iconColor: 'text-blue-600',
      },
      {
        id: 'inventory-low',
        title: (inventorySummary.low + inventorySummary.critical).toString(),
        subtitle: 'Low Stock Items',
        value: '',
        icon: AlertTriangle,
        color: 'text-red-600',
        borderColor: 'border-red-200',
        bgColor: 'bg-white',
        actionText: 'Resolve Now',
        actionLink: '/reports/inventory?filter=low',
        accentColor: 'bg-red-100 text-red-700',
        iconColor: 'text-red-600',
      },
      {
        id: 'customers',
        title: (stats?.totalCustomers || 0).toString(),
        subtitle: 'Total Customers', // All time generally
        value: '',
        icon: Users,
        color: 'text-purple-600',
        borderColor: 'border-purple-200',
        bgColor: 'bg-white',
        actionText: 'View Customers',
        actionLink: '/reports/crm',
        accentColor: 'bg-purple-100 text-purple-700',
        iconColor: 'text-purple-600',
      },
    ],
    quickActions: [
      {
        title: 'Quick Bill',
        desc: 'New POS Transaction',
        icon: FileText,
        gradient: 'from-blue-400 to-blue-600',
        link: '/billing/quick-bill',
      },
      {
        title: 'Live Orders',
        desc: 'Manage active orders',
        icon: ClipboardList,
        gradient: 'from-green-400 to-green-600',
        link: '/orders',
      },
      {
        title: 'Manage Menu',
        desc: 'Add or edit items',
        icon: Utensils,
        gradient: 'from-purple-400 to-purple-600',
        link: '/inventory/menu',
      },
      {
        title: 'View Reports',
        desc: 'Sales & analytics',
        icon: BarChart3,
        gradient: 'from-orange-400 to-orange-600',
        link: '/reports',
      },
    ],
    quickVisit: [
      {
        title: 'Manage Stock',
        desc: 'Update inventory stock',
        icon: Box,
        gradient: 'from-teal-400 to-teal-600',
        link: '/inventory/stock',
      },
      {
        title: 'Inventory Report',
        desc: 'View inventory full report',
        icon: Box,
        gradient: 'from-blue-400 to-blue-600', // Similar to reference
        link: '/reports/inventory',
      },
      {
        title: 'Stock Alerts',
        desc: 'See all the alerts for items',
        icon: AlertTriangle,
        gradient: 'from-red-400 to-red-600',
        link: '/reports/inventory?filter=low',
      },
    ],
  }

  return (
    <div className="space-y-4 sm:space-y-8 p-1">
      {/* Top Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {sections.topCards.map((card) => {
          const showSkeleton = !stats || !inventoryData
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border-2 ${card.borderColor} overflow-visible bg-white shadow-sm hover:shadow-md transition-shadow relative group`}
            >
              {showSkeleton ? (
                <div className="p-2 sm:p-4 flex flex-col items-center justify-center pt-4 sm:pt-8 space-y-2 sm:space-y-4">
                  <Skeleton className="w-6 h-6 sm:w-10 sm:h-10 rounded-full" />
                  <Skeleton className="h-5 sm:h-8 w-16 sm:w-24" />
                  <Skeleton className="h-3 sm:h-4 w-20 sm:w-32" />
                </div>
              ) : (
                <>
                  {card.id === 'sales' && (
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10">
                      <DateFilterComponent compact hideCustomRange />
                    </div>
                  )}
                  <div className="p-2 sm:p-4 flex flex-col items-center text-center pt-4 sm:pt-8">
                    <card.icon
                      className={`w-5 h-5 sm:w-8 sm:h-8 mb-2 sm:mb-3 ${card.iconColor} ${card.id === 'sales' ? 'opacity-0 sm:opacity-100' : ''}`}
                    />
                    <h3 className="text-base sm:text-2xl font-bold text-gray-800">
                      {card.title}
                    </h3>
                    <p className="text-gray-500 text-[10px] sm:text-sm font-medium">
                      {card.subtitle}
                    </p>
                  </div>
                  <Link
                    to={card.actionLink}
                    className={`block w-full py-1 sm:py-2 text-center text-[10px] sm:text-xs font-semibold ${card.accentColor} hover:opacity-90 transition-opacity flex items-center justify-center gap-1 rounded-b-xl`}
                  >
                    <span className="hidden sm:inline">{card.actionText}</span>
                    <span className="sm:hidden">View</span>
                    <ArrowRight className="w-2 h-2 sm:w-3 sm:h-3" />
                  </Link>
                </>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-sm sm:text-lg font-bold text-gray-800 mb-2 sm:mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {sections.quickActions.map((action) => (
            <motion.div
              key={action.title}
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              onClick={() => navigate({ to: action.link })}
              className={`relative overflow-hidden rounded-lg sm:rounded-xl p-3 sm:p-6 cursor-pointer bg-linear-to-br ${action.gradient} text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group`}
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-white opacity-10 rounded-full blur-2xl -mr-6 sm:-mr-10 -mt-6 sm:-mt-10 transition-transform group-hover:scale-150" />

              <div className="relative z-10">
                <div className="bg-white/20 w-8 h-8 sm:w-12 sm:h-12 rounded-md sm:rounded-lg flex items-center justify-center mb-2 sm:mb-4 backdrop-blur-sm">
                  <action.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-xs sm:text-lg font-bold mb-0.5 sm:mb-1">
                  {action.title}
                </h3>
                <p className="text-white/80 text-[10px] sm:text-sm hidden sm:block">
                  {action.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Visit Section */}
      <div>
        <h2 className="text-sm sm:text-lg font-bold text-gray-800 mb-2 sm:mb-4">
          Quick Visit
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
          {sections.quickVisit.map((visit) => (
            <motion.div
              key={visit.title}
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate({ to: visit.link })}
              className={`relative overflow-hidden rounded-lg sm:rounded-xl p-3 sm:p-6 cursor-pointer bg-linear-to-br ${visit.gradient} text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group`}
            >
              <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-white opacity-10 rounded-full blur-3xl -mr-6 sm:-mr-10 -mt-6 sm:-mt-10" />

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="bg-white/20 w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-lg flex items-center justify-center mb-2 sm:mb-3 backdrop-blur-sm">
                  <visit.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-lg font-bold mb-0.5 sm:mb-1">
                    {visit.title}
                  </h3>
                  <p className="text-white/80 text-[10px] sm:text-sm hidden sm:block">
                    {visit.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OverviewPage
