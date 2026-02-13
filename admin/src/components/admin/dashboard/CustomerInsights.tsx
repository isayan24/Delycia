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
import { Link } from '@tanstack/react-router'
import { formatDateTime } from '@/utils/dateUtils'

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
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Customer Ordering Activity
          </h3>
          <p className="text-xs md:text-sm text-gray-500 font-medium">
            Recent activity by customers during the selected period
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-gray-100">
                <TableHead className="font-semibold text-gray-700 text-xs py-3">
                  Customer
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs py-3 text-center">
                  Orders
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs py-3">
                  Total Spent
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs py-3">
                  Last Order
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs py-3">
                  Items Ordered
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs py-3 text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-gray-400 font-medium"
                  >
                    No activity found for this period
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row) => (
                  <TableRow
                    key={row.userId}
                    className="hover:bg-gray-50/30 border-gray-100 transition-colors"
                  >
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">
                          {row.customerName || 'Guest'}
                        </span>
                        <span className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1 font-medium mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />{' '}
                          {row.phoneNumber || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="inline-flex items-center gap-1.5 font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-lg text-xs">
                        <ShoppingBag className="w-3 h-3 text-orange-500" />
                        {row.totalOrders}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-bold text-emerald-600 text-sm">
                        ₹{row.totalSpent.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5 text-gray-600 text-[10px] md:text-xs font-medium">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {formatDateTime(row.lastOrderDate)}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className="text-[10px] md:text-xs text-gray-500 truncate max-w-[150px] md:max-w-[200px] block font-medium"
                        title={row.topItems}
                      >
                        {row.topItems}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Link
                        to="/reports/crm"
                        search={{ customerId: row.userId.toString() }}
                        className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold text-xs bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-lg transition-all"
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
