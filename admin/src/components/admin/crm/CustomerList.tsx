import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  User,
  Calendar,
  MoreHorizontal,
  Phone,
  Mail,
  Eye,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Customer } from '@/hooks/queries/useCRMQueries'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import LoadingScreen from '@/components/common/LoadingScreen'

interface CustomerListProps {
  data: Customer[]
  isLoading: boolean
  onSelectCustomer: (id: string) => void
}

const CustomerList: React.FC<CustomerListProps> = ({
  data,
  isLoading,
  onSelectCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredData = data.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone_number.includes(searchTerm) ||
      (customer.email &&
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  )

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  if (isLoading) {
    return <LoadingScreen message="Loading CRM data..." />
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search name, phone, or email..."
            className="pl-10 h-10 bg-white border-gray-100 focus:bg-white focus:ring-orange-500/10 transition-all rounded-xl"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 self-start sm:self-auto">
          <User className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            {filteredData.length} Customers Found
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-gray-100">
                <TableHead className="w-[240px] font-bold text-gray-700 text-xs uppercase tracking-wider py-4 pl-6">
                  Customer
                </TableHead>
                <TableHead className="font-bold text-gray-700 text-xs uppercase tracking-wider py-4">
                  Engagement
                </TableHead>
                <TableHead className="font-bold text-gray-700 text-xs uppercase tracking-wider py-4">
                  Lifetime Value
                </TableHead>
                <TableHead className="font-bold text-gray-700 text-xs uppercase tracking-wider py-4">
                  Recent Activity
                </TableHead>
                <TableHead className="text-right font-bold text-gray-700 text-xs uppercase tracking-wider py-4 pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                        <User className="h-8 w-8 text-gray-200" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        No customers found
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your search terms
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((customer) => (
                  <TableRow
                    key={customer.user_id}
                    className="group cursor-pointer hover:bg-gray-50/50 border-gray-50 transition-colors"
                    onClick={() =>
                      onSelectCustomer(customer.user_id.toString())
                    }
                  >
                    <TableCell className="py-3.5 pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-gray-100">
                          <AvatarImage src={customer.profile_pic || ''} />
                          <AvatarFallback className="bg-linear-to-br from-orange-50 to-orange-100 text-orange-600 font-black text-sm">
                            {customer.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className=" text-gray-900 text-sm truncate group-hover:text-orange-600 transition-colors">
                            {customer.name}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium mt-0.5">
                            <Phone className="w-3 h-3" />
                            {customer.phone_number}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none  text-[10px] px-2 py-0.5"
                          >
                            {customer.visit_count} Visits
                          </Badge>
                        </div>
                        <span className="text-[10px] text-gray-400  uppercase tracking-tight">
                          Since{' '}
                          {new Date(customer.first_visit_at).toLocaleDateString(
                            undefined,
                            { month: 'short', year: 'numeric' },
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 font-[500] text-gray-900 text-sm">
                          <span>
                            ₹
                            {Number(customer.total_spent).toLocaleString(
                              'en-IN',
                              { minimumFractionDigits: 0 },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-[500] mt-0.5">
                          <TrendingUp className="w-3 h-3" />
                          <span>
                            AVG ₹{Number(customer.avg_order_value).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 ">
                          <Calendar className="w-3.5 h-3.5 text-orange-500" />
                          <span className="text-gray-900">
                            {new Date(
                              customer.last_visit_at,
                            ).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {customer.last_order_items &&
                          customer.last_order_items.length > 0 ? (
                            customer.last_order_items
                              .slice(0, 2)
                              .map((item, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-[9px] px-1.5 py-0 h-4.5 bg-gray-50 text-gray-500 border-gray-100  uppercase tracking-tight"
                                >
                                  {item}
                                </Badge>
                              ))
                          ) : (
                            <span className="text-[10px] text-gray-400 font-medium italic">
                              No items
                            </span>
                          )}
                          {customer.last_order_items &&
                            customer.last_order_items.length > 2 && (
                              <span className="text-[9px] text-gray-400 self-center ">
                                +{customer.last_order_items.length - 2}
                              </span>
                            )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-3.5 pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 rounded-xl shadow-xl border-gray-100 p-1"
                        >
                          <DropdownMenuLabel className="text-[10px]  text-gray-400 uppercase tracking-widest px-2 py-1.5">
                            Customer Actions
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 text-xs  rounded-lg focus:bg-orange-50 focus:text-orange-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(
                                customer.phone_number,
                              )
                            }}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Copy Phone
                          </DropdownMenuItem>
                          {customer.email && (
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-xs  rounded-lg focus:bg-orange-50 focus:text-orange-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard.writeText(
                                  customer.email || '',
                                )
                              }}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Copy Email
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 text-xs font-black text-orange-600 rounded-lg focus:bg-orange-50 focus:text-orange-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectCustomer(customer.user_id.toString())
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Full Insights
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-1">
          <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400">
            Page <span className="text-gray-900">{currentPage}</span> of{' '}
            <span className="text-gray-900">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-xl border-gray-100 text-xs font-bold disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Prev
            </Button>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-xl border-gray-100 text-xs font-bold disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerList
