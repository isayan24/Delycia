import { useSearch, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useInventoryLevelsQuery } from '@/hooks/queries/useDashboardQueries'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { Input } from '@/components/ui/input'
import { Search, Box, Filter } from 'lucide-react'
import LoadingScreen from '@/components/common/LoadingScreen'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { requireAuth } from '@/middleware/auth'
import { InventoryDesktopTable } from '@/components/admin/reports/InventoryDesktopTable'
import { InventoryMobileCards } from '@/components/admin/reports/InventoryMobileCards'

type InventoryFilter = 'all' | 'available' | 'low' | 'critical'

export const Route = createFileRoute('/reports/inventory/')({
  beforeLoad: requireAuth,
  component: InventoryReportPage,
  validateSearch: (search: Record<string, unknown>): { filter?: string } => {
    return {
      filter: (search.filter as string) || 'all',
    }
  },
})

function InventoryReportPage() {
  const { user } = useAdminAuthQuery()
  const navigate = Route.useNavigate()
  const search = useSearch({ from: '/reports/inventory/' })

  // Use search param as the source of truth for active tab
  const activeTab = (search.filter as InventoryFilter) || 'all'
  const [searchTerm, setSearchTerm] = useState('')

  const queryParams = {
    rid: user?.selected_rid ? String(user.selected_rid) : '',
    filter: activeTab === 'all' ? undefined : activeTab,
  }

  const { data, isLoading } = useInventoryLevelsQuery(queryParams)

  const inventoryItems = data?.inventory || []
  const summary = data?.summary || {
    total: 0,
    critical: 0,
    low: 0,
    good: 0,
    medium: 0,
  }

  const filteredItems = inventoryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleTabChange = (tabId: InventoryFilter) => {
    navigate({
      search: (old) => ({
        ...old,
        filter: tabId,
      }),
    })
  }

  const tabs = [
    {
      id: 'all' as InventoryFilter,
      label: 'All Items',
      count: summary.total,
      icon: Box,
      color: 'blue',
    },
    {
      id: 'available' as InventoryFilter,
      label: 'In Stock',
      count: (summary?.good || 0) + (summary?.medium || 0),
      icon: Box,
      color: 'emerald',
    },
    {
      id: 'low' as InventoryFilter,
      label: 'Low Stock',
      count: summary.low,
      icon: Box,
      color: 'orange',
    },
    {
      id: 'critical' as InventoryFilter,
      label: 'Out of Stock',
      count: summary.critical,
      icon: Box,
      color: 'red',
    },
  ]

  const getStockHealthColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500'
      case 'low':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      default:
        return 'bg-green-500'
    }
  }

  if (isLoading) {
    if (!user?.selected_rid) {
      return <LoadingScreen message="Loading inventory report..." />
    }

    // Skeleton UI
    return (
      <div className="bg-gray-50/50 min-h-screen p-4 font-sans">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>

          {/* Table Skeleton */}
          <Card className="border-gray-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
            <div className="p-3 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="p-0">
              <div className="space-y-2 p-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="font-sans px-3 py-4 md:py-8 max-w-7xl mx-auto space-y-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Stats Grid / Navigation */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon

            const colorConfig = {
              blue: 'bg-blue-50 text-blue-600 border-blue-100',
              emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
              orange: 'bg-orange-50 text-orange-600 border-orange-100',
              red: 'bg-red-50 text-red-600 border-red-100',
            }[tab.color]

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as InventoryFilter)}
                className={`
                  group relative flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 text-left
                  ${
                    isActive
                      ? `bg-white border-orange-200 shadow-[0px_0px_0px_1px_#ffa500] ring-2 ring-orange-100/50`
                      : 'bg-white border-[#ead9cd] dark:border-primary/10 hover:border-orange-200 hover:shadow-md'
                  }
                `}
              >
                <div
                  className={`
                  shrink-0 p-1 md:p-3 rounded-xl transition-colors
                  ${isActive ? 'bg-orange-100 text-orange-600' : `${colorConfig} opacity-80 group-hover:opacity-100`}
                `}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-0.5 transition-colors ${isActive ? 'text-orange-500' : 'text-[#a16b45] opacity-60'}`}
                  >
                    {tab.label}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-md md:text-2xl font-black text-slate-900 dark:text-white leading-none">
                      {tab.count}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-tight">
                      Items
                    </span>
                  </div>
                </div>

                {isActive && (
                  <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                )}
              </button>
            )
          })}
        </div>

        {/* Main Content Area */}
        <Card className="md:border-[#ead9cd] border-none dark:border-primary/10 md:shadow-sm shadow-none bg-white dark:bg-[#2d1e14] rounded-2xl overflow-visible">
          {/* Toolbar - Sticky on Mobile */}
          <div
            className="md:p-4 pb-4
           md:border-b border-[#ead9cd] dark:border-primary/10 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/95 dark:bg-[#2d1e14]/95 backdrop-blur-md rounded-t-2xl"
          >
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm bg-slate-50/50 dark:bg-[#3a291d]/20 border-[#ead9cd] dark:border-primary/10 focus:bg-white dark:focus:bg-[#3a291d] focus:ring-orange-500/10 transition-all rounded-xl"
              />
            </div>
          </div>

          {/* Product List Container */}
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <div className="p-5 border-b border-[#ead9cd] dark:border-primary/10 bg-slate-50/10 dark:bg-background-dark/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-orange-500" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    Inventory Catalog
                  </h2>
                </div>
                <div className="flex items-center gap-2.5 bg-white/50 dark:bg-[#3a291d]/20 px-3 py-1.5 rounded-xl border border-[#ead9cd] dark:border-primary/5">
                  <Filter className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Showing {filteredItems.length} Products
                  </span>
                </div>
              </div>

              <InventoryDesktopTable
                items={filteredItems}
                getStockHealthColor={getStockHealthColor}
                onItemClick={(id) =>
                  navigate({ to: `/reports/inventory/${id}` })
                }
              />
            </div>

            {/* Mobile Card View */}
            <InventoryMobileCards
              items={filteredItems}
              getStockHealthColor={getStockHealthColor}
              onItemClick={(id) => navigate({ to: `/reports/inventory/${id}` })}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
