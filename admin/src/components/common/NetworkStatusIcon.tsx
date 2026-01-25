import { useMemo } from 'react'
import { useNetworkQuality } from '@/hooks/useNetworkQuality'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ArrowUp, ArrowDown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DynamicWifiIcon } from './DynamicWifiIcon'

export const NetworkStatusIcon = () => {
  const { online, downlink, rtt, loading, refresh } = useNetworkQuality()

  // Calculate Signal Level (0-4)
  const signalLevel = useMemo(() => {
    if (!online) return 0
    const dl = downlink || 0
    const latency = rtt || 0

    // Level 4 (Excellent): > 5 MB/s (~40Mbps) & < 100ms
    if (dl / 8 > 5 && latency < 100) return 4

    // Level 3 (Good): > 1 MB/s (~8Mbps) & < 200ms
    if (dl / 8 > 1 && latency < 200) return 3

    // Level 2 (Fair): > 0.5 MB/s (~4Mbps) & < 500ms
    if (dl / 8 > 0.5 && latency < 500) return 2

    // Level 1 (Weak): Connected but slow
    return 1
  }, [online, downlink, rtt])

  const statusColor = useMemo(() => {
    if (signalLevel === 0) return 'text-red-500'
    if (signalLevel === 4 || signalLevel === 3) return 'text-emerald-500'
    if (signalLevel === 2) return 'text-yellow-500'
    return 'text-orange-500'
  }, [signalLevel])

  const handleRefresh = async () => {
    await refresh()
  }

  // Convert Mbps to MB/s (1 Byte = 8 bits)
  const speedMB = downlink ? (downlink / 8).toFixed(2) : '0'
  const connectionDetails = `Speed: ${speedMB} MB/s • Latency: ${rtt} ms`

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-1.5 gap-2 select-none w-full">
            {/* Indicators Group */}
            <div
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium',
                statusColor,
              )}
            >
              <ArrowUp className="w-3 h-3" />
              <ArrowDown className="w-3 h-3" />

              <DynamicWifiIcon
                level={signalLevel as any}
                className="w-3.5 h-3.5"
              />

              <span>{online ? 'Online' : 'Offline'}</span>
            </div>

            {/* Actions Group */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-gray-200 text-gray-500 rounded-full"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw
                  className={cn('w-3 h-3', loading && 'animate-spin')}
                />
              </Button>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-medium text-xs">{connectionDetails}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
