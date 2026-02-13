import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { useUpdateStock } from '@/hooks/queries/useInventoryQueries'
import { Loader2, Zap } from 'lucide-react'
import useToast from '@/hooks/UseToast'

interface QuickRestockButtonProps {
  inventoryId: number
  rid: number
  currentStock: number
  itemName: string
  onStockUpdate?: () => void
  className?: string
}

export function QuickRestockButton({
  inventoryId,
  rid,
  currentStock,
  itemName,
  onStockUpdate,
  className,
}: QuickRestockButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [stockValue, setStockValue] = useState(currentStock)
  const { mutate: updateStock, isPending } = useUpdateStock()
  const { showSuccess, showError } = useToast()

  // Reset stock value when popover opens or currentStock changes
  useEffect(() => {
    if (isOpen) {
      setStockValue(currentStock)
    }
  }, [isOpen, currentStock])

  const handleUpdate = () => {
    updateStock(
      { id: inventoryId, rid, stock: stockValue },
      {
        onSuccess: () => {
          showSuccess('Stock Updated', `${itemName} stock set to ${stockValue}`)
          setIsOpen(false)
          onStockUpdate?.()
        },
        onError: (error) => {
          showError('Update Failed', 'Failed to update stock')
          console.error(error)
        },
      },
    )
  }

  const handleSliderChange = (value: number[]) => {
    setStockValue(value[0])
  }

  const adjustStock = (amount: number) => {
    setStockValue((prev) => Math.max(0, prev + amount))
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 ${className || ''}`}
        >
          <Zap className="h-4 w-4" />
          Quick Restock
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Update Stock</h4>
            <span className="text-sm text-gray-500">
              Current: {currentStock}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Slider
                defaultValue={[currentStock]}
                value={[stockValue]}
                max={200} // Reasonable default max, could be dynamic
                step={1}
                onValueChange={handleSliderChange}
                className="py-4"
              />
            </div>
            <Input
              type="number"
              value={stockValue}
              onChange={(e) => setStockValue(Number(e.target.value))}
              className="w-20 h-8"
            />
          </div>

          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => adjustStock(10)}>
              +10
            </Button>
            <Button variant="outline" size="sm" onClick={() => adjustStock(20)}>
              +20
            </Button>
            <Button variant="outline" size="sm" onClick={() => adjustStock(50)}>
              +50
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStockValue(0)}
            >
              Clear
            </Button>
          </div>

          <Button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            onClick={handleUpdate}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Update Stock
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
