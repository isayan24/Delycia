import { Button as StatefulBtn } from '@/components/ui/stateful-button'
import React from 'react'

import { Download } from 'lucide-react'

export default function OrderHistoryHeader({
  refreshHistory,
  onExport,
  loading,
}: any) {
  return (
    <div className="flex items-center gap-3">
      <StatefulBtn
        onClick={onExport}
        className="!rounded-lg gap-2 bg-white border text-black hover:bg-gray-100"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </StatefulBtn>
      <StatefulBtn
        onClick={refreshHistory}
        disabled={loading}
        className="!rounded-lg"
      >
        Refresh History
      </StatefulBtn>
    </div>
  )
}
