import { useSearch, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useInventoryLevelsQuery } from '@/hooks/queries/useDashboardQueries'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Search, AlertTriangle, CheckCircle, XCircle, Box } from 'lucide-react'
import LoadingScreen from '@/components/common/LoadingScreen'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

type InventoryFilter = 'all' | 'available' | 'low' | 'critical'

export const Route = createFileRoute('/reports/inventory')({
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
  const search = useSearch({ from: '/reports/inventory' })

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
    { id: 'all', label: 'All Items', count: summary.total },
    {
      id: 'available',
      label: 'Available',
      count: summary.good + summary.medium,
    },
    { id: 'low', label: 'Low Stock', count: summary.low },
    { id: 'critical', label: 'Out of Stock', count: summary.critical },
  ]

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'low':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium':
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <XCircle className="w-4 h-4 mr-1" />
      case 'low':
        return <AlertTriangle className="w-4 h-4 mr-1" />
      default:
        return <CheckCircle className="w-4 h-4 mr-1" />
    }
  }

  if (isLoading) return <LoadingScreen message="Loading inventory report..." />

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Box className="w-8 h-8 mr-3 text-orange-600" />
              Inventory Report
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and track your restaurant's stock levels.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as InventoryFilter)}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all flex items-center justify-center min-w-[120px] ${
                activeTab === tab.id
                  ? 'bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-orange-200 text-orange-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Stock Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-gray-500"
                    >
                      No items found in this category.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-500">
                        #{item.id}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            item.stockLevel,
                          )}`}
                        >
                          {getStatusIcon(item.stockLevel)}
                          {item.stockLevel === 'critical'
                            ? 'Out of Stock'
                            : item.stockLevel.charAt(0).toUpperCase() +
                              item.stockLevel.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {item.stock}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
