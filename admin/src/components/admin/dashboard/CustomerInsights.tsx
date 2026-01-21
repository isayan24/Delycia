import React, { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ExternalLink,
  Phone,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCustomerOrdersQuery } from '@/hooks/queries/useDashboardQueries'
import { useDateFilterStore } from '@/store/useDateFilterStore'
import { formatISTDateTime } from '../order-history/utils/historyDateUtils'
import { Link } from '@tanstack/react-router'

interface CustomerActivityProps {
  rid: string
}

const PAGE_SIZE = 10

const CustomerActivityTable: React.FC<CustomerActivityProps> = ({ rid }) => {
  const { currentDateRange } = useDateFilterStore()
  const [pageIndex, setPageIndex] = useState(0)

  // Create stable query params object
  const queryParams = useMemo(
    () => ({
      rid,
      startDate: currentDateRange.startDate,
      endDate: currentDateRange.endDate,
    }),
    [rid, currentDateRange.startDate, currentDateRange.endDate],
  )

  const { data = [], isLoading } = useCustomerOrdersQuery(queryParams)

  // Pagination logic
  const pageCount = Math.ceil(data.length / PAGE_SIZE)
  const paginatedData = useMemo(() => {
    const start = pageIndex * PAGE_SIZE
    return data.slice(start, start + PAGE_SIZE)
  }, [data, pageIndex])

  const canPreviousPage = pageIndex > 0
  const canNextPage = pageIndex < pageCount - 1

  const previousPage = () => setPageIndex((p) => Math.max(0, p - 1))
  const nextPage = () => setPageIndex((p) => Math.min(pageCount - 1, p + 1))

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse h-[400px]">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Customer Ordering Activity
          </h3>
          <p className="text-sm text-gray-500">
            Recent activity by customers during the selected period
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-medium">Customer</TableHead>
              <TableHead className="font-medium">Orders</TableHead>
              <TableHead className="font-medium">Total Spent</TableHead>
              <TableHead className="font-medium">Last Order</TableHead>
              <TableHead className="font-medium">Items Ordered</TableHead>
              <TableHead className="font-medium">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-gray-500"
                >
                  No activity found for this period
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow key={row.userId} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {row.customerName || 'Guest'}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {row.phoneNumber || 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-medium">
                      <ShoppingBag className="w-3 h-3 text-orange-500" />
                      {row.totalOrders}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-emerald-600">
                      ₹{row.totalSpent.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-gray-600 text-xs">
                      <Calendar className="w-3 h-3" />
                      {formatISTDateTime(row.lastOrderDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-xs text-gray-500 truncate max-w-[200px] block"
                      title={row.topItems}
                    >
                      {row.topItems}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/reports/crm"
                      search={{ customerId: row.userId.toString() }}
                      className="text-orange-600 hover:text-orange-700 hover:underline text-xs flex items-center gap-1"
                    >
                      Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={!canPreviousPage}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {pageIndex + 1} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={!canNextPage}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default CustomerActivityTable
