import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Box, ArrowUpRight } from 'lucide-react'
import { InventoryItem } from '@/types/dashboard.types'

interface InventoryMobileCardsProps {
  items: InventoryItem[]
  getStockHealthColor: (level: string) => string
  onItemClick: (id: number) => void
}

export function InventoryMobileCards({
  items,
  getStockHealthColor,
  onItemClick,
}: InventoryMobileCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {items.length === 0 ? (
        <div className="bg-white dark:bg-[#2d1e14] rounded-2xl border border-[#ead9cd] dark:border-primary/10 p-12 text-center">
          <div className="w-16 h-16 bg-orange-50 dark:bg-[#3a291d] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Box className="w-8 h-8 text-orange-200" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            No items found
          </p>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-black">
            Refine your search parameters
          </p>
        </div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className="group relative bg-white dark:bg-[#2d1e14] rounded-xl border border-[#ead9cd] dark:border-primary/10 shadow-sm active:scale-[0.99] transition-all p-4 space-y-4"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    SKU #{item.id}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <span
                    className={`
                      text-[9px] font-black uppercase tracking-widest leading-none
                      ${
                        item.stockLevel === 'critical'
                          ? 'text-red-500'
                          : item.stockLevel === 'low'
                            ? 'text-orange-500'
                            : 'text-emerald-500'
                      }
                    `}
                  >
                    {item.stockLevel.split('_').join(' ')}
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white truncate leading-tight group-hover:text-orange-600 transition-colors">
                  {item.name}
                </h3>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-colors mt-0.5" />
            </div>

            {/* Metrics Row */}
            <div className="flex items-center justify-between py-1">
              <div className="space-y-1">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Total Sold
                </p>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  {item.totalSold}{' '}
                  <span className="text-[9px] font-normal text-slate-400">
                    PCS
                  </span>
                </p>
              </div>
              <div className="h-6 w-px bg-slate-100 dark:bg-primary/5" />
              <div className="space-y-1">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Revenue
                </p>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  ₹{item.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="h-6 w-px bg-slate-100 dark:bg-primary/5" />
              <div className="space-y-1">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Customers
                </p>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  {item.uniqueCustomers}
                </p>
              </div>
            </div>

            {/* Stock Progress */}
            <div className="pt-1 space-y-2">
              <div className="flex justify-between items-end leading-none">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  Stock Level
                </p>
                <p
                  className={`text-[13px] font-black uppercase tracking-tight ${item.stock <= 10 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}
                >
                  {item.stock}{' '}
                  <span className="text-[13px] font-normal opacity-50">
                    Units
                  </span>
                </p>
              </div>
              <Progress
                value={Math.min((item.stock / 50) * 100, 100)}
                className="h-1 w-full bg-slate-50 dark:bg-[#3a291d] rounded-full"
                indicatorClassName={`${getStockHealthColor(item.stockLevel)} rounded-full`}
              />
            </div>
          </div>
        ))
      )}
    </div>
  )
}
