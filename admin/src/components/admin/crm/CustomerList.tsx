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
    return (
      <div className="p-8 text-center text-gray-500">Loading CRM data...</div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search customers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredData.length} customers
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Customer</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Visits</TableHead>
              <TableHead>Spending</TableHead>
              <TableHead>Recent Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((customer) => (
                <TableRow
                  key={customer.user_id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelectCustomer(customer.user_id.toString())}
                >
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={customer.profile_pic || ''} />
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {customer.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {customer.name}
                      </span>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Phone className="w-3 h-3 mr-1" />
                        {customer.phone_number}
                      </div>
                      {customer.email && (
                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                          <Mail className="w-3 h-3 mr-1" />
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {customer.visit_count} visits
                      </span>
                      <span className="text-xs text-gray-500">
                        First:{' '}
                        {new Date(customer.first_visit_at).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-green-600">
                        ${Number(customer.total_spent).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Avg: ${Number(customer.avg_order_value).toFixed(2)} /
                        order
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Last:{' '}
                        {new Date(customer.last_visit_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {customer.last_order_items &&
                          customer.last_order_items
                            .slice(0, 2)
                            .map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                <ShoppingBag className="w-3 h-3 mr-1" />
                                {item}
                              </span>
                            ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(customer.phone_number)
                          }}
                        >
                          Copy Phone
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectCustomer(customer.user_id.toString())
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
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
