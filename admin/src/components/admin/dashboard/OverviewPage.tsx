import React from 'react'
import {
  ShieldAlert,
  IndianRupee,
  Box,
  AlertTriangle,
  QrCode,
  FileText,
  Plus,
  BarChart3,
  Users,
  ArrowRight,
} from 'lucide-react'
import {
  useDashboardStatsQuery,
  useInventoryLevelsQuery,
} from '@/hooks/queries/useDashboardQueries'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'

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
        subtitle: 'Sales This Month',
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
        subtitle: 'Total Customers',
        value: '',
        icon: Users,
        color: 'text-purple-600',
        borderColor: 'border-purple-200',
        bgColor: 'bg-white',
        actionText: 'View Customers',
        actionLink: '/crm',
        accentColor: 'bg-purple-100 text-purple-700',
        iconColor: 'text-purple-600',
      },
    ],
    quickActions: [
      {
        title: 'Scan Item',
        desc: 'Check stock instantly',
        icon: QrCode,
        gradient: 'from-blue-400 to-blue-600',
        link: '/inventory/scan', // Hypothetical
      },
      {
        title: 'Create Bill',
        desc: 'New sale transaction',
        icon: FileText,
        gradient: 'from-green-400 to-green-600',
        link: '/pos', // Point of Sale
      },
      {
        title: 'Add Item',
        desc: 'Add to inventory',
        icon: Plus,
        gradient: 'from-purple-400 to-purple-600',
        link: '/inventory/add',
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
        title: 'Suppliers',
        desc: 'Manage suppliers',
        icon: Users,
        gradient: 'from-teal-400 to-teal-600',
        link: '/suppliers',
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
        icon: Box, // Using Box as generic icon if Alert specific not preferred
        gradient: 'from-red-400 to-red-600',
        link: '/alerts',
      },
    ],
  }

  return (
    <div className="space-y-8 p-1">
      {/* Top Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.topCards.map((card) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border ${card.borderColor} overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="p-4 flex flex-col items-center text-center">
              <card.icon className={`w-8 h-8 mb-3 ${card.iconColor}`} />
              <h3 className="text-2xl font-bold text-gray-800">{card.title}</h3>
              <p className="text-gray-500 text-sm font-medium">
                {card.subtitle}
              </p>
            </div>
            <Link
              to={card.actionLink}
              className={`block w-full py-2 text-center text-xs font-semibold ${card.accentColor} hover:opacity-90 transition-opacity flex items-center justify-center gap-1`}
            >
              {card.actionText} <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.quickActions.map((action, idx) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => navigate({ to: action.link })}
              className={`relative overflow-hidden rounded-xl p-6 cursor-pointer bg-linear-to-br ${action.gradient} text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group`}
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />

              <div className="relative z-10">
                <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1">{action.title}</h3>
                <p className="text-white/80 text-sm">{action.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Visit Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Visit</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.quickVisit.map((visit, idx) => (
            <motion.div
              key={visit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              onClick={() => navigate({ to: visit.link })}
              className={`relative overflow-hidden rounded-xl p-6 cursor-pointer bg-linear-to-br ${visit.gradient} text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10" />

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 backdrop-blur-sm">
                  <visit.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{visit.title}</h3>
                  <p className="text-white/80 text-sm">{visit.desc}</p>
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
