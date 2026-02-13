import { useSearch, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useInventoryLevelsQuery } from '@/hooks/queries/useDashboardQueries'
import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Box,
  ArrowUpRight,
  TrendingDown,
  Filter,
} from 'lucide-react'
import LoadingScreen from '@/components/common/LoadingScreen'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { requireAuth } from '@/middleware/auth'

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
      count: summary.good + summary.medium,
      icon: CheckCircle,
      color: 'emerald',
    },
    {
      id: 'low' as InventoryFilter,
      label: 'Low Stock',
      count: summary.low,
      icon: AlertTriangle,
      color: 'orange',
    },
    {
      id: 'critical' as InventoryFilter,
      label: 'Out of Stock',
      count: summary.critical,
      icon: XCircle,
      color: 'red',
    },
  ]

  const colorVariants: Record<string, string> = {
    blue: 'from-blue-50/50 via-white to-white border-blue-100/50 text-blue-600 bg-blue-50',
    emerald:
      'from-emerald-50/50 via-white to-white border-emerald-100/50 text-emerald-600 bg-emerald-50',
    orange:
      'from-orange-50/50 via-white to-white border-orange-100/50 text-orange-600 bg-orange-50',
    red: 'from-red-50/50 via-white to-white border-red-100/50 text-red-600 bg-red-50',
  }

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
    <div className="bg-gray-50/50 font-sans px-3 py-4 md:py-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] border border-gray-100/80">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              Inventory Report
            </h1>
            <p className="text-gray-500 mt-1 text-xs md:text-sm font-medium">
              Real-time stock monitoring & performance tracking.
            </p>
          </div>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-100 px-3 py-1 font-bold text-xs"
            >
              {summary.total} Total Items
            </Badge>
          </div>
        </div>

        {/* Stats Grid / Navigation */}
        <div className="flex flex-nowrap overflow-x-auto pb-2 -mx-3 px-3 md:grid md:grid-cols-4 gap-3 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const variant = colorVariants[tab.color]
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as InventoryFilter)}
                className={`
                  flex-none w-[135px] md:w-auto group relative flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all duration-300 text-left
                  ${
                    isActive
                      ? `bg-white border-orange-200 shadow-[0_8px_20px_-6px_rgba(249,115,22,0.12)] ring-1 ring-orange-100/50 bg-linear-to-br from-white to-orange-50/30`
                      : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
                  }
                `}
              >
                <div
                  className={`
                  shrink-0 p-1.5 rounded-xl transition-colors
                  ${isActive ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'}
                  ${!isActive && variant.split(' ').slice(4).join(' ')}
                `}
                >
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-0.5 transition-colors ${isActive ? 'text-orange-500' : 'text-gray-500'}`}
                  >
                    {tab.label}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg md:text-xl font-black text-gray-900 leading-none">
                      {tab.count}
                    </span>
                    <span className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase">
                      Items
                    </span>
                  </div>
                </div>

                {isActive && (
                  <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                )}
              </button>
            )
          })}
        </div>

        {/* Main Content Area */}
        <Card className="border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden bg-white rounded-2xl">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-orange-500/10 transition-all rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <Filter className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Found {filteredItems.length} Products
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-gray-100">
                  <TableHead className="w-[80px] font-bold text-gray-400 text-[10px] uppercase tracking-wider py-4 pl-6">
                    ID
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 text-xs uppercase tracking-wider py-4">
                    Product
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 text-xs uppercase tracking-wider py-4">
                    Status
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-700 text-xs uppercase tracking-wider py-4">
                    Sold
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-700 text-xs uppercase tracking-wider py-4">
                    Revenue
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-700 text-xs uppercase tracking-wider py-4">
                    Customers
                  </TableHead>
                  <TableHead className="min-w-[140px] text-right font-bold text-gray-700 text-xs uppercase tracking-wider py-4 pr-6">
                    Stock Level
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-72 text-center">
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                          <Box className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          No matching items
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try searching for a different product name
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50/50 cursor-pointer border-gray-50 transition-colors group"
                      onClick={() =>
                        navigate({ to: `/reports/inventory/${item.id}` })
                      }
                    >
                      <TableCell className="font-mono text-[10px]  text-gray-300 py-3.5 pl-6">
                        #{item.id}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className=" text-gray-900 text-sm group-hover:text-orange-600 transition-colors">
                          {item.name}
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <Badge
                          variant="secondary"
                          className={`
                            text-[10px] px-2 py-0.5  border-none
                             ${
                               item.stockLevel === 'critical'
                                 ? 'bg-red-50 text-red-600'
                                 : item.stockLevel === 'low'
                                   ? 'bg-orange-50 text-orange-600'
                                   : 'bg-emerald-50 text-emerald-600'
                             }
                           `}
                        >
                          <span className="flex items-center gap-1.5">
                            {item.stockLevel === 'critical' && (
                              <XCircle className="w-3 h-3" />
                            )}
                            {item.stockLevel === 'low' && (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            {item.stockLevel !== 'critical' &&
                              item.stockLevel !== 'low' && (
                                <CheckCircle className="w-3 h-3" />
                              )}
                            {item.stockLevel === 'critical'
                              ? 'Out of Stock'
                              : item.stockLevel === 'low'
                                ? 'Low Stock'
                                : 'In Stock'}
                          </span>
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right text-gray-600  text-sm py-3.5">
                        {item.totalSold.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-right  text-gray-900 text-sm py-3.5">
                        ₹{item.totalRevenue.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-right text-gray-500  text-xs py-3.5">
                        {item.uniqueCustomers.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-right py-3.5 pr-6">
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-xs font-black ${item.stock === 0 ? 'text-red-600' : 'text-gray-900'}`}
                            >
                              {item.stock}
                            </span>
                            <span className="text-gray-400 text-[9px]  uppercase tracking-wider">
                              Units
                            </span>
                          </div>
                          <Progress
                            value={Math.min((item.stock / 50) * 100, 100)}
                            className="h-1.5 w-28 bg-gray-50 rounded-full"
                            indicatorClassName={`${getStockHealthColor(item.stockLevel)} rounded-full shadow-[0_0_8px_rgba(0,0,0,0.05)]`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
