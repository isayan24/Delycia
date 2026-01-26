import { Button } from '@/components/ui/button'
import { Button as StatefulBtn } from '@/components/ui/stateful-button'

import { Download } from 'lucide-react'

export default function OrderHistoryHeader({
  refreshHistory,
  onExport,
  loading,
}: any) {
  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={onExport}
        className="!rounded-lg gap-2 bg-white border text-black hover:bg-gray-100"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </Button>
      <StatefulBtn
        onClick={refreshHistory}
        disabled={loading}
        className="!rounded-lg text-sm"
      >
        Refresh History
      </StatefulBtn>
    </div>
  )
}
