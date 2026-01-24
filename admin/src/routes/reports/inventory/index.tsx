import { useSearch, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useInventoryLevelsQuery } from '@/hooks/queries/useDashboardQueries'
import { useAuth } from '@/hooks/useAuth'
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

type InventoryFilter = 'all' | 'available' | 'low' | 'critical'

export const Route = createFileRoute('/reports/inventory/')({
  component: InventoryReportPage,
  validateSearch: (search: Record<string, unknown>): { filter?: string } => {
    return {
      filter: (search.filter as string) || 'all',
    }
  },
})

function InventoryReportPage() {
  const { user } = useAuth()
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
      id: 'all',
      label: 'All Items',
      count: summary.total,
      color: 'bg-gray-100 text-gray-700',
    },
    {
      id: 'available',
      label: 'In Stock',
      count: summary.good + summary.medium,
      color: 'bg-green-100 text-green-700',
    },
    {
      id: 'low',
      label: 'Low Stock',
      count: summary.low,
      color: 'bg-orange-100 text-orange-700',
    },
    {
      id: 'critical',
      label: 'Out of Stock',
      count: summary.critical,
      color: 'bg-red-100 text-red-700',
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
    <div className="bg-gray-50/50   font-sans">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Inventory Report
            </h1>
            <p className="text-gray-500 mt-0.5 text-sm">
              Track stock levels and sales performance.
            </p>
          </div>
          <div className="flex gap-2">
            {/* Can add export buttons here later */}
          </div>
        </div>

        {/* Stats Grid / Navigation */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as InventoryFilter)}
                className={`
                  relative flex flex-col items-start p-3 rounded-xl border transition-all duration-200 text-left
                  ${
                    isActive
                      ? 'bg-white border-orange-400 shadow-md ring-1 ring-orange-100'
                      : 'bg-white border-gray-100 hover:border-orange-100 hover:shadow-sm'
                  }
                `}
              >
                <div className="flex justify-between w-full mb-2">
                  <span
                    className={`text-xs font-semibold ${isActive ? 'text-orange-600' : 'text-gray-500'}`}
                  >
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-gray-900">
                    {tab.count}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    items
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Main Content Area */}
        <Card className="border-gray-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
          {/* Toolbar */}
          <div className="p-3 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Search by item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Showing {filteredItems.length} items</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 h-9">
                  <TableHead className="w-[80px] font-semibold text-gray-600 text-xs">
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 text-xs">
                    Item Details
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 text-xs">
                    Stock Status
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-600 text-xs">
                    Sold
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-600 text-xs">
                    Revenue
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-600 text-xs">
                    Customers
                  </TableHead>
                  <TableHead className="w-[150px] text-right font-semibold text-gray-600 text-xs">
                    Stock Level
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Box className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-lg font-medium text-gray-900">
                          No items found
                        </p>
                        <p className="text-sm">
                          Try adjusting your search or filter.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-orange-50/30 cursor-pointer transition-colors group h-10"
                      onClick={() =>
                        navigate({ to: `/reports/inventory/${item.id}` })
                      }
                    >
                      <TableCell className="font-mono text-xs text-gray-400 py-2">
                        #{item.id}
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="font-bold text-gray-900 text-sm">
                          {item.name}
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <Badge
                          variant="outline"
                          className={`
                            text-[10px] px-2 py-0.5
                             ${
                               item.stockLevel === 'critical'
                                 ? 'border-red-200 bg-red-50 text-red-700'
                                 : item.stockLevel === 'low'
                                   ? 'border-orange-200 bg-orange-50 text-orange-700'
                                   : 'border-green-200 bg-green-50 text-green-700'
                             }
                           `}
                        >
                          {item.stockLevel === 'critical' && (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {item.stockLevel === 'low' && (
                            <AlertTriangle className="w-3 h-3 mr-1" />
                          )}
                          {item.stockLevel !== 'critical' &&
                            item.stockLevel !== 'low' && (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                          {item.stockLevel === 'critical'
                            ? 'Out of Stock'
                            : item.stockLevel === 'low'
                              ? 'Low Stock'
                              : 'In Stock'}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right text-gray-600 font-medium text-sm py-2">
                        {item.totalSold}
                      </TableCell>

                      <TableCell className="text-right font-medium text-gray-900 text-sm py-2">
                        ₹{item.totalRevenue.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-right text-gray-600 text-sm py-2">
                        {item.uniqueCustomers}
                      </TableCell>

                      <TableCell className="text-right py-2">
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-xs font-bold ${item.stock === 0 ? 'text-red-600' : 'text-gray-900'}`}
                          >
                            {item.stock}{' '}
                            <span className="text-gray-400 text-[10px] font-normal">
                              units
                            </span>
                          </span>
                          <Progress
                            value={Math.min((item.stock / 50) * 100, 100)}
                            className="h-1.5 w-24 bg-gray-100"
                            indicatorClassName={getStockHealthColor(
                              item.stockLevel,
                            )}
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
