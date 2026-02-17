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
            className="group relative bg-white dark:bg-[#2d1e14] rounded-2xl border border-[#ead9cd] dark:border-primary/10 shadow-sm overflow-hidden active:scale-[0.98] transition-all"
          >
            {/* Status Side-Accent */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${
                item.stockLevel === 'critical'
                  ? 'bg-red-500'
                  : item.stockLevel === 'low'
                    ? 'bg-orange-500'
                    : 'bg-emerald-500'
              }`}
            />

            <div className="pl-4 pr-4 pt-4 pb-3 space-y-4">
              {/* Card Header */}
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      SKU #{item.id}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <Badge
                      className={`
                        text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 border-none leading-none
                        ${
                          item.stockLevel === 'critical'
                            ? 'bg-red-50 text-red-600'
                            : item.stockLevel === 'low'
                              ? 'bg-orange-50 text-orange-600'
                              : 'bg-emerald-50 text-emerald-600'
                        }
                      `}
                    >
                      {item.stockLevel.split('_').join(' ')}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-[500] text-slate-900 dark:text-white     truncate leading-tight group-hover:text-orange-600 transition-colors">
                    {item.name}
                  </h3>
                </div>
                <div className="shrink-0 p-2 rounded-xl bg-slate-50 dark:bg-[#3a291d]/40 border border-slate-100 dark:border-primary/5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                </div>
              </div>

              {/* Micro-Metrics Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50/50 dark:bg-[#3a291d]/10 p-2 rounded-xl border border-slate-100 dark:border-primary/5">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
                    Total Sold
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {item.totalSold}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400">
                      PCS
                    </span>
                  </div>
                </div>
                <div className="bg-emerald-50/30 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-100/30 dark:border-emerald-900/10">
                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1 leading-none">
                    Revenue
                  </p>
                  <p className="text-xs font-black text-emerald-600">
                    ₹{item.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50/50 dark:bg-[#3a291d]/10 p-2 rounded-xl border border-slate-100 dark:border-primary/5">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
                    Unique
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {item.uniqueCustomers}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400">
                      USR
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock Progress Foundation */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-end leading-none px-0.5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Available Stock Level
                  </p>
                  <p
                    className={`text-xs font-black uppercase tracking-tight ${item.stock <= 10 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}
                  >
                    {item.stock}{' '}
                    <span className="text-[9px] opacity-40">Units</span>
                  </p>
                </div>
                <Progress
                  value={Math.min((item.stock / 50) * 100, 100)}
                  className="h-1.5 w-full bg-slate-100 dark:bg-[#3a291d] rounded-full"
                  indicatorClassName={`${getStockHealthColor(item.stockLevel)} rounded-full shadow-[0_0_8px_rgba(0,0,0,0.05)]`}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
