import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RemoveShoppingCart } from '@mui/icons-material'
import { Package, Loader2 } from 'lucide-react'
import React from 'react'
import useInventoryStore from '../main-file/UseInventoryStates'

interface StockSwitchProps {
  variableId: string
  status: string
  variableType: string
}

export default function StockSwitch({
  variableId,
  status,
  variableType,
}: StockSwitchProps) {
  const { handleStockSwitch, getVariableStockStatus, isPendingStockUpdate } =
    useInventoryStore()

  const variableStatus =
    status == 'available' || status == 'low_stock' ? true : false

  // Get the stock status for this specific category
  const isStockSwitchActive = getVariableStockStatus(variableId, variableStatus)

  // Check if this category has a pending stock update
  const isPending = isPendingStockUpdate(variableId)

  return (
    <div className="flex items-center gap-2 [500px]:gap-1">
      <div className="relative inline-grid h-6 grid-cols-[1fr_1fr] items-center text-sm font-medium max-[500px]:scale-85">
        <Switch
          id={variableId}
          name="stock-switch"
          checked={isStockSwitchActive}
          onCheckedChange={() =>
            handleStockSwitch(variableId, variableStatus, variableType)
          }
          onClick={(e) => e.stopPropagation()}
          disabled={isPending} // Disable during pending operations
          className="peer data-[state=unchecked]:bg-red-600 data-[state=checked]:bg-green-500 absolute inset-0 h-[inherit] w-auto [&_span]:z-10 [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:ease-[cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-full [&_span]:data-[state=checked]:rtl:-translate-x-full"
        />
        <span className="pointer-events-none relative ms-0.5 flex min-w-6 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:!text-white peer-data-[state=unchecked]:translate-x-full peer-data-[state=unchecked]:rtl:-translate-x-full">
          {isPending ? (
            <Loader2
              className="!text-[.9rem] animate-spin"
              aria-hidden="true"
            />
          ) : (
            <RemoveShoppingCart className="!text-[.9rem]" aria-hidden="true" />
          )}
        </span>
        <span className="peer-data-[state=checked]:text-background pointer-events-none relative me-0.5 flex min-w-6 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:-translate-x-full peer-data-[state=unchecked]:invisible peer-data-[state=checked]:rtl:translate-x-full">
          {isPending ? (
            <Loader2 size={12} className="animate-spin" aria-hidden="true" />
          ) : (
            <Package size={12} aria-hidden="true" />
          )}
        </span>
      </div>
      <Label className="w-[6rem] text-[1rem] max-[500px]:text-[0.8rem] max-[500px]:w-[4.5rem] font-[400] duration-150 ease-in-out">
        {isPending
          ? 'Processing...'
          : isStockSwitchActive
            ? 'In Stock'
            : 'Out of Stock'}
      </Label>
    </div>
  )
}
