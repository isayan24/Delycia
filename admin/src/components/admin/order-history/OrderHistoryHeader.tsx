import { Button } from '@/components/ui/button'
import { Button as StatefulBtn } from '@/components/ui/stateful-button'
import { Download, RefreshCw } from 'lucide-react'

export default function OrderHistoryHeader({
  refreshHistory,
  onExport,
  loading,
}: any) {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onExport}
        variant="outline"
        className="rounded-xl! gap-2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-10 px-4 sm:px-5 font-medium shadow-sm transition-all"
      >
        <Download className="w-4 h-4" />
        <span className="hidden xs:inline">Export</span>
      </Button>
      <StatefulBtn
        onClick={refreshHistory}
        disabled={loading}
        className="rounded-xl! text-sm flex h-10 px-4 sm:px-6 gap-2 bg-green-500 hover:bg-green-600 text-white border-none shadow-md shadow-green-200/50 transition-all font-semibold"
      >
        <span className="">{loading ? 'Refreshing...' : 'Refresh'}</span>
      </StatefulBtn>
    </div>
  )
}
