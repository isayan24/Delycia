import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Bell, BellOff } from 'lucide-react'
import { useWebSocketManager } from '@/hooks/useWebSocketManager'
import { useGlobalOrderPopupStore } from '@/store/useGlobalOrderPopupStore'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function OrdersHeader() {
  const { orders, status, isConnected, refreshOrders } = useWebSocketManager()
  const { popupsEnabled, togglePopups } = useGlobalOrderPopupStore()

  const orderCount = orders.length

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-md transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SidebarTrigger className="-ml-1 h-9 w-9 text-gray-500 hover:bg-gray-100 transition-colors" />
        <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />

        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Orders
            </h1>
            <div
              className={`size-2 rounded-full shrink-0 ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}
              title={isConnected ? 'Connected' : status}
            />
          </div>
          <Badge
            variant="secondary"
            className="text-[10px] font-black uppercase tracking-wider bg-orange-50 dark:bg-[#3a291d] text-[#a16b45] px-2 py-0.5 rounded flex items-center gap-1 shrink-0 border-none"
          >
            {orderCount}{' '}
            <span className="hidden xs:inline-block">
              {orderCount === 1 ? 'order' : 'orders'}
            </span>
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2.5 ml-auto no-print">
        <Button
          variant={popupsEnabled ? 'default' : 'outline'}
          size="sm"
          onClick={togglePopups}
          className={`h-9 w-9 sm:w-auto sm:px-3 p-0 sm:gap-2 rounded-lg transition-all font-black text-[10px] uppercase tracking-wider ${
            popupsEnabled
              ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100 dark:shadow-none text-white border-none'
              : 'bg-white dark:bg-[#2d1e14] border-slate-200 dark:border-white/10 text-slate-600'
          }`}
        >
          {popupsEnabled ? (
            <Bell className="h-3.5 w-3.5" strokeWidth={3} />
          ) : (
            <BellOff className="h-3.5 w-3.5 text-rose-500" strokeWidth={3} />
          )}
          <span className="hidden sm:inline-block">
            {popupsEnabled ? 'Popups On' : 'Popups Off'}
          </span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshOrders}
          className="h-9 w-9 sm:w-auto sm:px-3 p-0 sm:gap-2 rounded-lg border-slate-200 dark:border-white/10 text-slate-600 font-black text-[10px] uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shrink-0 bg-white dark:bg-transparent"
        >
          <RefreshCw className="h-3.5 w-3.5 text-orange-500" strokeWidth={3} />
          <span className="hidden sm:inline-block">Refresh</span>
        </Button>
      </div>
    </header>
  )
}
