import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Box, XCircle, AlertTriangle, CheckCircle } from 'lucide-react'
import { InventoryItem } from '@/types/dashboard.types'

interface InventoryDesktopTableProps {
  items: InventoryItem[]
  getStockHealthColor: (level: string) => string
  onItemClick: (id: number) => void
  isLoading?: boolean
}

export function InventoryDesktopTable({
  items,
  getStockHealthColor,
  onItemClick,
}: InventoryDesktopTableProps) {
  return (
    <div className="hidden md:block bg-white dark:bg-[#2d1e14] rounded-2xl overflow-hidden transition-all">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/5 dark:bg-[#3a291d]/10">
            <TableRow className="border-[#ead9cd] dark:border-primary/10 hover:bg-transparent">
              <TableHead className="w-20 pl-6 h-12 text-[12px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                ID
              </TableHead>
              <TableHead className="h-12 text-[12px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                Product
              </TableHead>
              <TableHead className="h-12 text-[12px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                Status
              </TableHead>
              <TableHead className="h-12 text-right text-[12px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                Sold
              </TableHead>
              <TableHead className="h-12 text-right text-[12px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                Revenue
              </TableHead>
              <TableHead className="h-12 text-right text-[12px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                Customers
              </TableHead>
              <TableHead className="min-w-[160px] pr-6 text-right text-[12px] font-black uppercase tracking-widest text-[#a16b45] opacity-60">
                Stock Level
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-72 text-center">
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-orange-50 dark:bg-[#3a291d] rounded-2xl flex items-center justify-center mb-4">
                      <Box className="w-8 h-8 text-orange-200" />
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      No matching items
                    </p>
                    <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest text-[10px] font-black">
                      Try searching for a different product
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-[#ead9cd]/50 dark:border-primary/5 hover:bg-orange-50/10 dark:hover:bg-[#3a291d]/10 transition-all group cursor-pointer"
                  onClick={() => onItemClick(item.id)}
                >
                  <TableCell className="py-4 pl-6 font-mono text-[13px] text-slate-800">
                    #{item.id}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-lg font-[400] text-slate-900 dark:text-white tracking-tight group-hover:text-orange-600 transition-colors">
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="secondary"
                      className={`
                        text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-none shadow-xs
                        ${
                          item.stockLevel === 'critical'
                            ? 'bg-red-100 text-red-600'
                            : item.stockLevel === 'low'
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-emerald-100 text-emerald-600'
                        }
                      `}
                    >
                      <span className="flex items-center gap-1.5">
                        {item.stockLevel === 'critical' ? (
                          <XCircle className="w-3 h-3" />
                        ) : item.stockLevel === 'low' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {item.stockLevel.split('_').join(' ')}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-4 font-[500] text-slate-600 dark:text-slate-400 text-[13px">
                    {item.totalSold.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right py-4 font-[500] text-emerald-600 text-[13px">
                    ₹{item.totalRevenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right py-4 font-[500] text-slate-400 text-[13px">
                    {item.uniqueCustomers.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right py-4 pr-6">
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-black uppercase tracking-tight ${item.stock <= 10 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}
                        >
                          {item.stock}{' '}
                          <span className="opacity-40 text-[9px]">
                            In Stock
                          </span>
                        </span>
                      </div>
                      <Progress
                        value={Math.min((item.stock / 50) * 100, 100)}
                        className="h-1.5 w-32 bg-slate-100 dark:bg-[#3a291d] rounded-full"
                        indicatorClassName={`${getStockHealthColor(item.stockLevel)} rounded-full`}
                      />
                    </div>
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
