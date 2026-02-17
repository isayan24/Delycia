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
import {
  Search,
  Phone,
  Mail,
  TrendingUp,
  Users,
  ChevronRight,
} from 'lucide-react'
import { Customer } from '@/hooks/queries/useCRMQueries'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useLoadMore } from '@/hooks/useLoadMore'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CustomerListProps {
  data: Customer[]
  isLoading: boolean
  onSelectCustomer: (id: string) => void
}

const MobileCustomerCard: React.FC<{
  customer: Customer
  onSelect: (id: string) => void
}> = ({ customer, onSelect }) => (
  <div
    onClick={() => onSelect(customer.user_id.toString())}
    className="bg-white dark:bg-[#2d1e14] rounded-xl p-3 border border-[#ead9cd] dark:border-primary/10 shadow-sm active:scale-[0.98] transition-all"
  >
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 border-2 border-white dark:border-[#3a291d] shadow-sm">
        <AvatarImage src={customer.profile_pic || ''} />
        <AvatarFallback className="bg-orange-50 dark:bg-[#3a291d] text-orange-600 font-black text-sm uppercase">
          {customer.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[15px] font-[500] text-slate-900 dark:text-white truncate tracking-wider">
            {customer.name}
          </h4>
          <span className="text-[10px] font-black text-orange-600 bg-orange-50 dark:bg-orange-900/10 px-1.5 py-0.5 rounded-md uppercase">
            {customer.visit_count} Visits
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#a16b45] font-semibold mt-1">
          <Phone className="w-3 h-3" />
          {customer.phone_number}
        </div>
      </div>
    </div>

    <div className="mt-3 pt-3 border-t border-slate-50 dark:border-primary/5 grid grid-cols-2 gap-2">
      <div className="space-y-0.5">
        <p className="text-[8px] font-bold text-[#a16b45]/60 uppercase tracking-widest">
          Lifetime Value
        </p>
        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase">
          ₹{Number(customer.total_spent).toLocaleString('en-IN')}
        </p>
      </div>
      <div className="space-y-0.5 text-right">
        <p className="text-[8px] font-bold text-[#a16b45]/60 uppercase tracking-widest">
          Last Visit
        </p>
        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase">
          {new Date(customer.last_visit_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  </div>
)

const CustomerList: React.FC<CustomerListProps> = ({
  data,
  isLoading,
  onSelectCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = React.useMemo(() => {
    return data.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone_number.includes(searchTerm) ||
        (customer.email &&
          customer.email.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [data, searchTerm])

  const { visibleItems, sentinelRef, hasMore } = useLoadMore(filteredData, 12)

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full bg-slate-100 dark:bg-[#3a291d] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 bg-slate-100 dark:bg-[#3a291d] rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full max-w-xl group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a16b45] group-focus-within:text-orange-600 transition-colors" />
          <Input
            placeholder="Search with (Name, Phone, Email)..."
            className="pl-11 h-11 bg-white dark:bg-[#2d1e14] border border-[#ead9cd] dark:border-primary/10 focus:ring-orange-500/10 transition-all rounded-xl text-xs lg:text-sm font-[500] tracking-wider placeholder:text-[#a16b45]/40"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Mobile View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3">
        {visibleItems.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-[#2d1e14] rounded-2xl border border-dashed border-[#ead9cd] dark:border-primary/10">
            <Users className="h-10 w-10 text-[#a16b45]/20 mx-auto mb-2" />
            <p className="text-xs font-black text-[#a16b45] uppercase tracking-widest">
              No matching records
            </p>
          </div>
        ) : (
          visibleItems.map((customer) => (
            <MobileCustomerCard
              key={customer.user_id}
              customer={customer}
              onSelect={onSelectCustomer}
            />
          ))
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block bg-white dark:bg-[#2d1e14] rounded-2xl border border-[#ead9cd] dark:border-primary/10 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-[#3a291d]/20">
            <TableRow className="border-b border-[#ead9cd] dark:border-primary/5 hover:bg-transparent">
              <TableHead className="py-4 pl-6 text-[10px] lg:text-xs font-medium text-[#a16b45] uppercase tracking-widest">
                Customer
              </TableHead>
              <TableHead className="py-4 text-[10px] lg:text-xs font-medium text-[#a16b45] uppercase tracking-widest">
                Engagement
              </TableHead>
              <TableHead className="py-4 text-[10px] lg:text-xs font-medium text-[#a16b45] uppercase tracking-widest">
                Economics
              </TableHead>
              <TableHead className="py-4 text-[10px] lg:text-xs font-medium text-[#a16b45] uppercase tracking-widest text-right">
                Activity
              </TableHead>
              <TableHead className="w-10 pr-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="h-10 w-10 text-[#a16b45]/20 mb-3" />
                    <p className="text-xs lg:text-sm font-black text-[#a16b45] uppercase tracking-widest">
                      Database empty or no matches
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              visibleItems.map((customer) => (
                <TableRow
                  key={customer.user_id}
                  className="group cursor-pointer hover:bg-orange-50/5 dark:hover:bg-[#3a291d]/10 border-b border-[#ead9cd]/50 dark:border-primary/5 transition-colors"
                  onClick={() => onSelectCustomer(customer.user_id.toString())}
                >
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white dark:border-[#3a291d] group-hover:border-orange-200 transition-colors shadow-sm">
                        <AvatarImage src={customer.profile_pic || ''} />
                        <AvatarFallback className="bg-orange-50 dark:bg-[#3a291d] text-orange-600 font-[500] text-sm uppercase">
                          {customer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs lg:text-[16px] font-[500] text-slate-900 dark:text-white   group-hover:text-orange-600 transition-colors">
                          {customer.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] lg:text-xs text-[#a16b45] font-semibold mt-0.5">
                          <Phone className="w-2.5 h-2.5" />
                          <span className="truncate max-w-[150px]">
                            {customer.phone_number || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="hover:bg-orange-50 bg-orange-50 dark:bg-orange-900/10 text-orange-600 border-none text-[9px] lg:text-[12px] font-black uppercase px-2 py-0.5">
                          {customer.visit_count} VISITS
                        </Badge>
                      </div>
                      <p className="text-[9px] lg:text-[13px] font-[410] text-[#262626] tracking-tight">
                        Memb. Since{' '}
                        {new Date(customer.first_visit_at).getFullYear()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-xs lg:text-[15px] font-[500] text-slate-900 dark:text-white uppercase">
                        ₹{Number(customer.total_spent).toLocaleString('en-IN')}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] lg:text-[12px] text-emerald-600 font-[500] uppercase tracking-tighter">
                        <TrendingUp className="w-3 h-3" />
                        AVG ₹{Number(customer.avg_order_value).toFixed(0)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <p className="text-[10px] lg:text-[15px] font-[500] text-slate-900 dark:text-white ">
                        {new Date(customer.last_visit_at).toLocaleDateString(
                          undefined,
                          {
                            month: 'long',
                            day: 'numeric',
                          },
                        )}
                      </p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-[9px] w-fit ml-auto lg:text-[12px] font-[500] text-[#070707] opacity-60 cursor-help">
                              {customer.last_order_items?.[0] || 'No Data'}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent
                            side="left"
                            className="bg-white dark:bg-[#2d1e14] border-[#ead9cd] dark:border-primary/10 text-slate-900 dark:text-white p-2 shadow-xl"
                          >
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-[#a16b45] uppercase tracking-widest border-b border-[#ead9cd] dark:border-primary/5 pb-1 mb-1">
                                Last Order Items
                              </p>
                              {customer.last_order_items?.map((item, i) => (
                                <div
                                  key={i}
                                  className="text-[12px] font-medium"
                                >
                                  • {item}
                                </div>
                              ))}
                              {(!customer.last_order_items ||
                                customer.last_order_items.length === 0) && (
                                <p className="text-[11px] text-[#a16b45]/60">
                                  No items found
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6">
                    <ChevronRight className="h-4 w-4 text-[#000000] opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Infinite Scroll Sentinel */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="h-20 flex items-center justify-center"
        >
          <div className="flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-widest animate-pulse">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            <span>Loading more...</span>
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
          </div>
        </div>
      )}

      {/* End of results message */}
      {!hasMore && filteredData.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-[10px] font-black text-[#a16b45]/40 uppercase tracking-[0.2em]">
            End of Results
          </p>
        </div>
      )}
    </div>
  )
}

export default CustomerList
