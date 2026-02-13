// components/TableNotFoundCard.tsx
'use client'

import { Scan, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TableNotFoundCardProps {
  onScanClick?: () => void
}

export default function TableNotFoundCard({
  onScanClick,
}: TableNotFoundCardProps) {
  return (
    <div className="w-full max-w-md bg-amber-50/50 border border-amber-100 rounded-xl p-3 shadow-sm backdrop-blur-sm flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
      <div className="flex items-center gap-3 text-left">
        <div className="flex-none w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 leading-none">
            Table Required
          </h4>
          <p className="text-xs text-gray-500 mt-1">Scan QR code to order.</p>
        </div>
      </div>

      {onScanClick && (
        <Button
          onClick={onScanClick}
          size="sm"
          className="bg-[#DC7F02] hover:bg-[#c97402] text-white shadow-sm rounded-lg text-xs h-9 px-3 shrink-0 w-full sm:w-auto"
        >
          <Scan className="w-3.5 h-3.5 mr-2" />
          Scan QR
        </Button>
      )}
    </div>
  )
}
