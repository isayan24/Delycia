import { Button } from '@/components/ui/button'
import { Button as StatefulBtn } from '@/components/ui/stateful-button'
import { Download, History } from 'lucide-react'

export default function OrderHistoryHeader({
  refreshHistory,
  onExport,
  loading,
}: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] border border-gray-100/80">
      <div className="flex items-center space-x-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
          <History className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        <div>
          <h1 className="text-base md:text-xl font-bold tracking-tight text-gray-900 leading-tight">
            Order History
          </h1>
          <p className="hidden sm:block text-[11px] md:text-sm text-gray-500 font-medium mt-0.5">
            Review past orders, customer details, and performance
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={onExport}
          variant="outline"
          className="h-8 md:h-9 px-3 text-[10px] md:text-xs font-bold bg-white border-gray-100 text-gray-600 rounded-xl hover:bg-gray-50 shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export
        </Button>
        <StatefulBtn
          onClick={refreshHistory}
          disabled={loading}
          className="h-8 md:h-9 px-3 text-[10px] md:text-xs font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-sm transition-all active:scale-95"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </StatefulBtn>
      </div>
    </div>
  )
}
