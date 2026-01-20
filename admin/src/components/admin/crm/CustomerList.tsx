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
  ShoppingBag,
  Calendar,
  MoreHorizontal,
  Phone,
  Mail,
  Eye,
  TrendingUp,
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

  const filteredData = data.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone_number.includes(searchTerm) ||
      (customer.email &&
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (isLoading) {
    return <LoadingScreen message="Loading CRM data..." />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, phone, or email..."
            className="pl-9 bg-white border-gray-200 focus-visible:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
          Total Customers:{' '}
          <span className="text-gray-900">{filteredData.length}</span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[280px] font-semibold">
                Customer
              </TableHead>
              <TableHead className="font-semibold">Engagement</TableHead>
              <TableHead className="font-semibold">Lifetime Value</TableHead>
              <TableHead className="font-semibold">Recent Activity</TableHead>
              <TableHead className="text-right font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <User className="h-8 w-8 mb-2 opacity-20" />
                    <p className="font-medium">No customers found</p>
                    <p className="text-xs text-gray-400">
                      Try adjusting your search terms
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((customer) => (
                <TableRow
                  key={customer.user_id}
                  className="group cursor-pointer hover:bg-orange-50/30 transition-colors"
                  onClick={() => onSelectCustomer(customer.user_id.toString())}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-gray-100 shadow-sm">
                        <AvatarImage src={customer.profile_pic || ''} />
                        <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                          {customer.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                          {customer.name}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {customer.phone_number}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                        >
                          {customer.visit_count} Visits
                        </Badge>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        Since{' '}
                        {new Date(customer.first_visit_at).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <span>
                          ₹
                          {Number(customer.total_spent).toLocaleString(
                            'en-IN',
                            { minimumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
                        <TrendingUp className="w-3 h-3" />
                        <span>
                          Avg: ₹{Number(customer.avg_order_value).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium text-gray-700">
                          {new Date(customer.last_visit_at).toLocaleDateString(
                            undefined,
                            { month: 'short', day: 'numeric' },
                          )}
                        </span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {customer.last_order_items &&
                        customer.last_order_items.length > 0 ? (
                          customer.last_order_items
                            .slice(0, 2)
                            .map((item, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-5 bg-gray-50 text-gray-600 border-gray-200 font-normal"
                              >
                                {item}
                              </Badge>
                            ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            No items
                          </span>
                        )}
                        {customer.last_order_items &&
                          customer.last_order_items.length > 2 && (
                            <span className="text-[10px] text-gray-400 self-center">
                              +{customer.last_order_items.length - 2} more
                            </span>
                          )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel className="text-xs font-normal text-gray-400 uppercase tracking-wider">
                          Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          className="cursor-pointer gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(customer.phone_number)
                          }}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Copy Phone
                        </DropdownMenuItem>
                        {customer.email && (
                          <DropdownMenuItem
                            className="cursor-pointer gap-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(customer.email)
                            }}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Copy Email
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 text-primary focus:text-primary focus:bg-primary/5 font-medium"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectCustomer(customer.user_id.toString())
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
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
  )
}

export default CustomerList
